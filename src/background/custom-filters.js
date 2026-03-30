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

import { store } from 'hybrids';
import { parseFilters, FilterType } from '@ghostery/adblocker';

import { CUSTOM_FILTERS_ID_RANGE, getDynamicRulesIds } from '/utils/dnr.js';
import convert from '/utils/dnr-converter.js';
import * as engines from '/utils/engines.js';
import * as OptionsObserver from '/utils/options-observer.js';

import Options from '/store/options.js';
import CustomFilters from '/store/custom-filters.js';

import { setup, reloadMainEngine } from './adblocker/index.js';
import { updateRedirectProtectionRules } from './redirect-protection.js';
import ManagedConfig from '/store/managed-config.js';

function isTrustedScriptInject(scriptName) {
  return (
    scriptName === 'rpnt' || scriptName === 'replace-node-text' || scriptName.startsWith('trusted-')
  );
}

async function updateDNRRules(dnrRules) {
  const removeRuleIds = await getDynamicRulesIds(CUSTOM_FILTERS_ID_RANGE);

  if (removeRuleIds.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
  }

  if (dnrRules.length) {
    dnrRules = dnrRules.map((rule, index) => ({
      ...rule,
      id: CUSTOM_FILTERS_ID_RANGE.start + index,
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: dnrRules,
    });

    console.info(`[custom filters] DNR updated with rules: ${dnrRules.length}`);
  }

  if (removeRuleIds.length || dnrRules.length) {
    // Reload redirect protection rules to include custom filters changes
    await updateRedirectProtectionRules(await store.resolve(Options));
  }

  return dnrRules;
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

async function collectFilters(text, { isTrustedScriptInjectAllowed }) {
  const baseEngine = await engines.init(engines.FIXES_ENGINE);
  const { networkFilters, cosmeticFilters, preprocessors, notSupportedFilters } = parseFilters(
    text,
    {
      ...baseEngine.config,
      debug: true,
    },
  );

  const disabledNetworkFilterIds = preprocessors.reduce(function (state, preprocessor) {
    if (engines.isFilterConditionAccepted(preprocessor.condition) === false) {
      for (const filterId of preprocessor.filterIDs) {
        state.add(filterId);
      }
    }
    return state;
  }, new Set());

  const errors = notSupportedFilters.reduce(function (state, notSupportedFilter) {
    if (notSupportedFilter.filterType === FilterType.NOT_SUPPORTED_ADGUARD) {
      state.push(
        `Filter not supported (${notSupportedFilter.lineNumber}): ${notSupportedFilter.filter}`,
      );
    }
    return state;
  }, []);
  const acceptedCosmeticFilters = cosmeticFilters.filter(function (filter) {
    if (filter.isScriptInject() === false || isTrustedScriptInjectAllowed === true) {
      return true;
    }

    const scriptNameIndex = filter.selector.indexOf(',');
    const scriptName =
      scriptNameIndex === -1 ? filter.selector : filter.selector.slice(0, scriptNameIndex);
    if (isTrustedScriptInject(scriptName)) {
      errors.push(
        `Trusted scriptlets are not allowed (${findLineNumber(filter.rawLine)}): ${filter.rawLine}`,
      );

      return false;
    }

    return true;
  });
  const acceptedNetworkFilters = networkFilters.filter(function (filter) {
    return disabledNetworkFilterIds.has(filter.getId()) === false;
  });

  return {
    networkFilters: acceptedNetworkFilters,
    cosmeticFilters: acceptedCosmeticFilters,
    preprocessors,
    errors,
  };
}

async function updateEngine({ networkFilters, cosmeticFilters, preprocessors }) {
  await engines.create(engines.CUSTOM_ENGINE, {
    networkFilters,
    cosmeticFilters,
    preprocessors,
  });

  console.info(
    `[custom filters] Engine updated with network filters: ${networkFilters.length}, cosmetic filters: ${cosmeticFilters.length}`,
  );
}

export async function updateCustomFilters(input, options) {
  // Ensure update of the custom filters is done after the main engine is initialized
  setup.pending && (await setup.pending);

  const { networkFilters, cosmeticFilters, preprocessors, errors } = await collectFilters(input, {
    isTrustedScriptInjectAllowed: options.trustedScriptlets,
  });

  // Update custom filters engine
  await updateEngine({ networkFilters, cosmeticFilters, preprocessors });

  // Update main engine with custom filters
  await reloadMainEngine();

  if (!__CHROMIUM__) {
    return {
      networkFilters: networkFilters.length,
      cosmeticFilters: cosmeticFilters.length,
      errors,
    };
  }

  // Update DNR rules for Chromium and Safari
  const converted = await convert(networkFilters.map((f) => f.toString()));
  const dnrRules = await updateDNRRules(converted.rules);

  if (errors?.length) {
    errors.push(...converted.errors);
  }

  return {
    networkFilters: networkFilters.length,
    cosmeticFilters: cosmeticFilters.length,
    errors,
    dnrRules,
  };
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
        await updateCustomFilters(text, value);

        // Avoid multiple updates and exit early
        return;
      }
    }
  }

  // 1. Background startup
  // 2. Custom filters are enabled
  // 3. We cannot initialize engine (adblocker version mismatch, etc.)
  // Result: Re-initialize custom engine
  if (!lastValue && value.enabled && !(await engines.init(engines.CUSTOM_ENGINE))) {
    const { text } = await store.resolve(CustomFilters);
    await updateCustomFilters(text, value);
  } else if (
    __CHROMIUM__ &&
    lastValue &&
    // Omit if `trustedScriptlets` is changed, as user then must click "save" button
    value.trustedScriptlets === lastValue.trustedScriptlets
  ) {
    if (value.enabled) {
      const { text } = await store.resolve(CustomFilters);
      await updateCustomFilters(text, value);
    } else {
      // When disabling custom filters, we need to remove all DNR rules
      // as they are not removed automatically
      // TODO: Save DNR rules after converting to avoid re-converting when enabling
      await updateDNRRules([]);
    }
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'customFilters:update') {
    store.resolve(Options).then((options) => {
      updateCustomFilters(msg.input, options.customFilters).then(sendResponse);
    });

    return true;
  }
});
