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
import {
  parseFilters,
  detectFilterType,
  FilterType,
  FiltersEngine,
  parseFilter,
} from '@ghostery/adblocker';

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

/**
 * @param {import('@ghostery/adblocker').CosmeticFilter} filter
 * @param {string[]} args
 */
function encodeScriptInject(filter, args) {
  // Cosmetic filter saves the whole script inject arguments in
  // `filter.selector`: e.g. `script, arg1, arg2, ...`
  const frontIndex = filter.selector.indexOf(',');
  // If the delim was not found, it doesn't have any args.
  if (frontIndex !== -1) {
    filter.selector =
      // Make the range comma-inclusive
      filter.selector.slice(0, frontIndex + 1) +
      args.map((arg) => encodeURIComponent(arg)).join(',');
    // Update the raw line as we will grab this value before
    // passing to the actual engine.
    filter.rawLine = filter.rawLine.split('+js(')[0] + '+js(' + filter.selector + ')';
  }
}

function getPreprocessorCondition(engine, filter) {
  const conditions = [];
  for (const preprocessor of engine.preprocessors.preprocessors) {
    if (!preprocessor.filterIDs.has(filter.getId())) {
      continue;
    }
    conditions.push(preprocessor.condition);
  }
  if (conditions.length === 0) {
    return undefined;
  }
  if (conditions.length === 1) {
    return conditions[0];
  }
  return conditions.map((condition) => `(${condition})`).join('&&');
}

/**
 * @returns {Record<'cosmeticFilters' | 'networkFilters' | 'errors', string[]>}
 */
async function normalizeFilters(text = '', { trustedScriptlets }) {
  const lines = text.split('\n');
  const uniqueFilterIds = new Set();
  const cosmeticFilters = [];
  const errors = [];

  // Try to iterate for each line (regardless of the filter type)
  // to collect errors.
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const filterType = detectFilterType(line, { extendedNonSupportedTypes: true });

    // Skip errors that we don't want to report.
    if (
      filterType === FilterType.NOT_SUPPORTED_EMPTY ||
      filterType === FilterType.NOT_SUPPORTED_COMMENT
    ) {
      continue;
    }

    // Detect the possible errors from `detectFilterType`.
    if (filterType === FilterType.NOT_SUPPORTED_ADGUARD) {
      errors.push(`Filter not supported (${index + 1}): ${line}`);
      continue;
    }

    // Detect if the syntax is invalid from the parse phase. All
    // error detections outside of the syntax should be processed
    // before here.
    const filter = parseFilter(line);
    if (filter === null) {
      errors.push(`Syntax error (${index + 1}): ${line}`);
      continue;
    }

    // We will only stringify the cosmetic filters here. Network
    // filters collection depend on full list parsing with
    // preprocessors.
    if (!filter.isCosmeticFilter()) {
      continue;
    }

    // Filter out duplicates. We share `uniqueFilterIds` with the
    // network filters below, so we only want to add cosmetic
    // filter id here.
    if (uniqueFilterIds.has(filter.getId())) {
      continue;
    } else {
      uniqueFilterIds.add(filter.getId());
    }

    if (filter.isScriptInject()) {
      // In case of script inject filter, `parseScript` always
      // returns a value.
      const script = filter.parseScript();
      if (!trustedScriptlets && isTrustedScriptInject(script.name)) {
        errors.push(`Trusted scriptlets are not allowed (${index + 1}): ${line}`);
        continue;
      }
      encodeScriptInject(filter, script.args);
    }

    cosmeticFilters.push(filter.toString());
  }

  const engine = await engines.get(engines.MAIN_ENGINE);
  const adblocker = FiltersEngine.parse(text, {
    ...engine.config,
    debug: true,
  });
  const networkFilters = adblocker
    .getFilters()
    .networkFilters.filter(function (filter) {
      const condition = getPreprocessorCondition(adblocker, filter);
      // Filter by preprocessor condition.
      if (typeof condition !== 'undefined' && !engines.evaluatePreprocessorCondition(condition)) {
        return false;
      }
      // Filter by uniqueness.
      if (uniqueFilterIds.has(filter.getId())) {
        return false;
      }
      uniqueFilterIds.add(filter.getId());
      return true;
    })
    .map(function (filter) {
      return filter.toString();
    });

  return {
    networkFilters,
    cosmeticFilters,
    errors,
  };
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

  return dnrRules;
}

async function updateEngine(text) {
  const { networkFilters, cosmeticFilters, preprocessors } = parseFilters(text);

  await engines.create(engines.CUSTOM_ENGINE, {
    cosmeticFilters,
    networkFilters,
    preprocessors,
  });

  console.info(
    `[custom filters] Engine updated with network filters: ${networkFilters.length}, cosmetic filters: ${cosmeticFilters.length}`,
  );

  return {
    networkFilters: networkFilters.length,
    cosmeticFilters: cosmeticFilters.length,
  };
}

export async function updateCustomFilters(input, options) {
  // Ensure update of the custom filters is done after the main engine is initialized
  setup.pending && (await setup.pending);

  const { networkFilters, cosmeticFilters, errors } = await normalizeFilters(input, options);
  const result = await updateEngine([...networkFilters, ...cosmeticFilters].join('\n'));

  result.errors = errors;

  // Update main engine with custom filters
  await reloadMainEngine();

  // Update DNR rules for Chromium and Safari
  if (__CHROMIUM__) {
    const { rules, errors } = await convert([...networkFilters].map((f) => f.toString()));

    if (errors?.length) {
      result.errors.push(...errors);
    }

    result.dnrRules = await updateDNRRules(rules);

    // Reload redirect protection rules to include custom filters changes
    await updateRedirectProtectionRules(await store.resolve(Options));
  }

  return result;
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
