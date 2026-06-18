/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { store, msg } from 'hybrids';

import { parseFilters, FilterType } from '@ghostery/adblocker';

import convert from '/utils/dnr-converter.js';
import * as engines from '/utils/engines.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { isUserScriptsSupported } from '/utils/user-scripts.js';

import Options from '/store/options.js';
import CustomFilters from '/store/custom-filters.js';
import ManagedConfig from '/store/managed-config.js';

import { setup, reloadMainEngine } from '../adblocker/engines.js';

import { updateDNRRules } from './dnr.js';
import { fetchFilterList, cleanupFilterLists, refreshFilterLists } from './filter-lists.js';

function isTrustedScriptInject(scriptName) {
  return (
    scriptName === 'rpnt' || scriptName === 'replace-node-text' || scriptName.startsWith('trusted-')
  );
}

function encodeScriptletArguments(filter) {
  if (!filter.isScriptInject() || !filter.selector) {
    return;
  }

  const parsed = filter.parseScript();
  if (!parsed || !parsed.name) {
    return;
  }

  const encodedArgs = parsed.args.map((arg) => encodeURIComponent(arg));
  filter.selector = [parsed.name, ...encodedArgs].join(', ');
  filter.scriptletDetails = undefined;
}

function findLineNumber(text, line) {
  const index = text.indexOf(line);
  if (index === -1) {
    return -1;
  }
  if (index === 0) {
    return 1;
  }
  let lines = 1;
  for (let i = 0; i < index; i++) {
    // Detect new lines: \n or \r
    if (text.charCodeAt(i) === 10 || text.charCodeAt(i) === 13) {
      lines++;
    }
  }
  return lines;
}

async function collectFilters(text, { trustedScriptlets }) {
  const baseConfig = await engines.getConfig();
  const { networkFilters, cosmeticFilters, preprocessors, notSupportedFilters } = parseFilters(
    text,
    {
      ...baseConfig,
      debug: true,
    },
  );

  const errors = notSupportedFilters.reduce(function (state, { filter, filterType, lineNumber }) {
    if (
      filterType !== FilterType.NOT_SUPPORTED_EMPTY &&
      filterType !== FilterType.NOT_SUPPORTED_COMMENT
    ) {
      state.push(`Filter not supported (${lineNumber + 1}): ${filter}`);
    }
    return state;
  }, []);
  const acceptedCosmeticFilters = cosmeticFilters.filter(function (filter) {
    if (filter.isScriptInject() === false || trustedScriptlets === true) {
      return true;
    }

    const scriptNameIndex = filter.selector.indexOf(',');
    const scriptName =
      scriptNameIndex === -1 ? filter.selector : filter.selector.slice(0, scriptNameIndex);
    if (isTrustedScriptInject(scriptName)) {
      errors.push(
        `Trusted scriptlets are not allowed (${findLineNumber(text, filter.rawLine)}): ${filter.rawLine}`,
      );
      return false;
    }

    return true;
  });

  for (const filter of acceptedCosmeticFilters) {
    encodeScriptletArguments(filter);
  }

  /**
   * @type {Map<number, string>}
   */
  let filterIdToRawLine = null;
  if (__CHROMIUM__) {
    filterIdToRawLine = new Map();
    for (const filter of networkFilters) {
      filterIdToRawLine.set(filter.getId(), filter.rawLine);
    }
  }

  return {
    networkFilters,
    filterIdToRawLine,
    cosmeticFilters: acceptedCosmeticFilters,
    preprocessors,
    errors,
  };
}

// Rebuilds the custom engine and DNR rules from the user input
// and cached remote lists, without reloading the main engine
async function rebuildCustomFilters({ trustedScriptlets, filterLists }) {
  // Ensure update of the custom filters is done after the main engine is initialized
  setup.pending && (await setup.pending);

  const customFilters = await store.resolve(CustomFilters);
  const userScripts = !__CHROMIUM__ || isUserScriptsSupported();

  // The user input is the primary source - the parse errors are reported back.
  // Remote lists are parsed with their own trusted scriptlets setting,
  // and their unsupported filters are silently skipped.
  const sources = [
    {
      text: customFilters.text,
      trustedScriptlets,
      primary: true,
    },
  ];

  if (userScripts) {
    for (const [url, { enabled, trustedScriptlets: urlTrustedScriptlets }] of Object.entries(
      filterLists,
    )) {
      const text = customFilters.filterLists[url]?.text;
      if (enabled && text) {
        sources.push({ url, text, trustedScriptlets: urlTrustedScriptlets });
      }
    }
  }

  let networkFilters = [];
  let cosmeticFilters = [];
  let preprocessors = [];
  // Errors of the local hand-added rules (primary source)
  let errors = [];
  // Compilation errors kept separately for each filter list (keyed by URL)
  const listErrors = {};
  const filterIdToRawLine = __CHROMIUM__ ? new Map() : null;

  for (const source of sources) {
    const result = await collectFilters(source.text, {
      trustedScriptlets: source.trustedScriptlets,
    });

    networkFilters = networkFilters.concat(result.networkFilters);
    cosmeticFilters = cosmeticFilters.concat(result.cosmeticFilters);
    preprocessors = preprocessors.concat(result.preprocessors);

    if (source.primary) {
      errors = errors.concat(result.errors);
    } else {
      listErrors[source.url] = result.errors;
    }

    if (__CHROMIUM__) {
      for (const [id, rawLine] of result.filterIdToRawLine) {
        filterIdToRawLine.set(id, rawLine);
      }
    }
  }

  // Update custom filters engine
  const engine = await engines.create(engines.CUSTOM_ENGINE, {
    networkFilters,
    cosmeticFilters,
    preprocessors,
  });

  const result = {
    networkFilters: networkFilters.length,
    cosmeticFilters: cosmeticFilters.length,
  };

  // Update DNR rules for Chromium
  if (__CHROMIUM__) {
    const acceptedNetworkFilters = engine
      .getFilters()
      .networkFilters.filter(function (filter) {
        return engine.preprocessors.isFilterExcluded(filter) === false;
      })
      .map(function (filter) {
        return filterIdToRawLine.get(filter.getId());
      });
    const { rules, errors: convertErrors } = await convert(acceptedNetworkFilters);

    try {
      result.dnrRules = await updateDNRRules(rules);
    } catch (e) {
      result.dnrRules = [];
      errors.push(e.message);
    }

    if (convertErrors?.length) {
      errors = errors.concat(convertErrors);
    }
  }

  // Keep the latest results in the model, so they can be displayed in the UI
  await store.set(CustomFilters, {
    networkFilters: networkFilters.length,
    cosmeticFilters: cosmeticFilters.length,
    dnrRules: result.dnrRules?.length || 0,
    userScripts,
    errors,
    // Update compilation errors for each cached filter list (cleared when none)
    filterLists: Object.fromEntries(
      Object.keys(customFilters.filterLists).map((url) => [url, { errors: listErrors[url] || [] }]),
    ),
  });

  console.info('[custom-filters] Engine rebuild completed with result:', result);

  return result;
}

// Refreshes remote filter lists and rebuilds the custom engine if any of them
// changed. The main engine is not reloaded - it is up to the caller.
export async function updateFilterLists({ cache = true } = {}) {
  console.info('[custom-filters] Refreshing remote filter lists...');

  if (await refreshFilterLists({ cache })) {
    const options = await store.resolve(Options);
    await rebuildCustomFilters(options.customFilters);

    return true;
  }

  return false;
}

OptionsObserver.addListener('customFilters', async (value, lastValue) => {
  // Check managed config custom filters. Managed config has to enable it first,
  // so we proceed only if customFilters are enabled (performance optimization).
  if (value.enabled) {
    const managedConfig = await store.resolve(ManagedConfig);
    if (managedConfig.customFilters.enabled) {
      const currentText = (await store.resolve(CustomFilters)).text;
      const text = managedConfig.customFilters.filters.join('\n');

      // Update custom filters only if the text is different
      if (text !== currentText) {
        await store.set(CustomFilters, { text });

        await rebuildCustomFilters(value);
        await reloadMainEngine();

        // Avoid multiple updates and exit early
        return;
      }
    }
  }

  // Background startup
  if (!lastValue) {
    // Custom filters are enabled, but the engine is not initialized
    if (value.enabled && !(await engines.init(engines.CUSTOM_ENGINE))) {
      await rebuildCustomFilters(value);
      await reloadMainEngine();
    }

    // The browser-level "Allow user scripts" toggle (Chromium) has no event, so
    // detect a change by comparing the state used at the last rebuild. When it
    // toggles, rebuild to add or remove remote lists (rebuild persists the state).
    if (__CHROMIUM__ && value.enabled) {
      const customFilters = await store.resolve(CustomFilters);

      if (customFilters.userScripts !== isUserScriptsSupported()) {
        await rebuildCustomFilters(value);
        await reloadMainEngine();

        return;
      }
    }

    // No need to proceed with other checks on startup
    return;
  }

  // Omit if `trustedScriptlets` is changed, as user then must click "save" button
  if (value.trustedScriptlets !== lastValue.trustedScriptlets) return;

  // Remote filter lists are changed
  if (!OptionsObserver.isOptionEqual(value.filterLists, lastValue.filterLists)) {
    // Clean up cached content of removed lists
    await cleanupFilterLists(value);

    if (value.enabled) {
      // Fetch missing lists (e.g. URLs added on another device via sync)
      await refreshFilterLists();

      // Rebuild custom filters and reload the main engine to apply changes
      await rebuildCustomFilters(value);
      await reloadMainEngine();

      return;
    }
  }

  // Enabled state is changed
  // Only applies to Chromium, as switching enabled state on Firefox
  // does not require rebuilding the engine
  if (__CHROMIUM__) {
    if (value.enabled && !lastValue.enabled) {
      await rebuildCustomFilters(value);
      await reloadMainEngine();
    }

    if (!value.enabled && lastValue.enabled) {
      // When disabling custom filters, we need to remove all DNR rules
      // as they are not removed automatically
      await updateDNRRules([]);
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'customFilters:updateRules': {
      (async () => {
        try {
          await store.set(CustomFilters, { text: message.input });

          // Rebuild custom filters and return the result to the settings page
          const options = await store.resolve(Options);
          await rebuildCustomFilters(options.customFilters);

          // Reload the main engine to apply changes in the new filters
          await reloadMainEngine();

          sendResponse(msg`Filter rules have been updated`);
        } catch (e) {
          await store.set(CustomFilters, { errors: [e.message] }).catch(() => {});
          sendResponse(msg`Failed to update filter rules`);
        }
      })();

      return true;
    }
    case 'customFilters:addFilterList': {
      (async () => {
        try {
          const managedConfig = await store.resolve(ManagedConfig);
          if (managedConfig.customFilters.enabled) {
            throw new Error('Custom filters are managed by your organization');
          }

          await fetchFilterList(message.url);
          sendResponse({});
        } catch (e) {
          sendResponse({ error: e.message });
        }
      })();

      return true;
    }
  }
});
