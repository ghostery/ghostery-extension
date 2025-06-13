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
  CosmeticFilter,
} from '@ghostery/adblocker';

import {
  createDocumentConverter,
  createOffscreenConverter,
} from '/utils/dnr-converter.js';
import * as engines from '/utils/engines.js';
import * as OptionsObserver from '/utils/options-observer.js';

import Options from '/store/options.js';
import CustomFilters from '/store/custom-filters.js';

import { setup, reloadMainEngine } from './adblocker.js';

const convert =
  __PLATFORM__ === 'chromium'
    ? createOffscreenConverter()
    : createDocumentConverter();

class TrustedScriptletError extends Error {}

// returns a scriptlet with encoded arguments
// returns undefined if not a scriptlet
// throws if scriptlet cannot be trusted
function fixScriptlet(filter, trustedScriptlets) {
  const cosmeticFilter = CosmeticFilter.parse(filter);

  if (
    !cosmeticFilter ||
    !cosmeticFilter.isScriptInject() ||
    !cosmeticFilter.selector
  ) {
    return null;
  }

  const parsedScript = cosmeticFilter.parseScript();

  if (!parsedScript || !parsedScript.name) {
    return null;
  }

  if (
    !trustedScriptlets &&
    (parsedScript.name === 'rpnt' ||
      parsedScript.name === 'replace-node-text' ||
      parsedScript.name.startsWith('trusted-'))
  ) {
    throw new TrustedScriptletError();
  }

  const [front] = filter.split(`#+js(${parsedScript.name}`);
  const args = parsedScript.args.map((arg) => encodeURIComponent(arg));
  return `${front}#+js(${[parsedScript.name, ...args].join(', ')})`;
}

function normalizeFilters(text = '', { trustedScriptlets }) {
  const rows = text.split('\n').map((f) => f.trim());

  return rows.reduce(
    (filters, filter, index) => {
      if (!filter) return filters;

      const filterType = detectFilterType(filter, {
        extendedNonSupportedTypes: true,
      });
      if (filterType === FilterType.NETWORK) {
        filters.networkFilters.add(filter);
      } else if (filterType === FilterType.COSMETIC) {
        try {
          const scriptlet = fixScriptlet(filter, trustedScriptlets);
          filters.cosmeticFilters.add(scriptlet || filter);
        } catch (e) {
          if (e instanceof TrustedScriptletError) {
            filters.errors.push(
              `Trusted scriptlets are not allowed (${index + 1}): ${filter}`,
            );
          } else {
            console.error(e);
          }
        }
      } else if (
        filterType === FilterType.NOT_SUPPORTED ||
        filterType === FilterType.NOT_SUPPORTED_ADGUARD
      ) {
        filters.errors.push(`Filter not supported (${index + 1}): ${filter}`);
      }
      return filters;
    },
    {
      networkFilters: new Set(),
      cosmeticFilters: new Set(),
      errors: [],
    },
  );
}

async function updateDNRRules(dnrRules) {
  const dynamicRules = (await chrome.declarativeNetRequest.getDynamicRules())
    .filter(({ id }) => id >= 1000000 && id < 2000000)
    .map(({ id }) => id);

  if (dynamicRules.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: dynamicRules,
      // ids between 1 and 2 million are reserved for dynamic rules
    });
  }

  if (dnrRules.length) {
    dnrRules = dnrRules.map((rule, index) => ({
      ...rule,
      id: 1000000 + index,
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

  engines.create(engines.CUSTOM_ENGINE, {
    cosmeticFilters,
    networkFilters,
    preprocessors,
    config: (await engines.init(engines.FIXES_ENGINE)).config,
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

  const { networkFilters, cosmeticFilters, errors } = normalizeFilters(
    input,
    options,
  );

  const result = await updateEngine(
    [
      ...(__PLATFORM__ === 'firefox' ? networkFilters : []),
      ...cosmeticFilters,
    ].join('\n'),
  );

  result.errors = errors;

  // Update main engine with custom filters
  await reloadMainEngine();

  // Update DNR rules for Chromium and Safari
  if (__PLATFORM__ === 'chromium' || __PLATFORM__ === 'safari') {
    const dnrResult = await Promise.allSettled(
      [...networkFilters].map((filter) => convert(filter)),
    );

    const dnrRules = [];
    for (const result of dnrResult) {
      if (result.value.errors?.length) {
        errors.push(...result.value.errors);
      }

      for (const rule of result.value.rules) {
        if (rule.condition.regexFilter) {
          const { isSupported, reason } =
            await chrome.declarativeNetRequest.isRegexSupported({
              regex: rule.condition.regexFilter,
            });
          if (!isSupported) {
            errors.push(
              `Could not apply a custom filter as "${rule.condition.regexFilter}" is a not supported regexp due to: ${reason}`,
            );
            continue;
          }
        }
        dnrRules.push(rule);
      }
    }

    result.dnrRules = await updateDNRRules(dnrRules);
  }

  return result;
}

OptionsObserver.addListener('customFilters', async (value, lastValue) => {
  // 1. Background startup
  // 2. Custom filters are enabled
  // 3. We cannot initialize engine (adblocker version mismatch, etc.)
  // Result: Re-initialize custom engine
  if (
    !lastValue &&
    value.enabled &&
    !(await engines.init(engines.CUSTOM_ENGINE))
  ) {
    const { text } = await store.resolve(CustomFilters);
    await updateCustomFilters(text, value);
  } else if (
    (__PLATFORM__ === 'chromium' || __PLATFORM__ === 'safari') &&
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
