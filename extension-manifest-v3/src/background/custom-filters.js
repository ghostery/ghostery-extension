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
} from '@cliqz/adblocker';

import {
  createDocumentConverter,
  createOffscreenConverter,
} from '/utils/dnr-converter.js';
import * as engines from '/utils/engines.js';

import Options, { observe } from '/store/options.js';
import CustomFilters from '/store/custom-filters.js';

import { initializedMainEngine } from './adblocker.js';

const convert =
  __PLATFORM__ !== 'safari' && __PLATFORM__ !== 'firefox'
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

function updateEngine(text) {
  const { networkFilters, cosmeticFilters, preprocessors } = parseFilters(text);

  engines.create(engines.CUSTOM_ENGINE, {
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

async function update(text, { trustedScriptlets }) {
  const { networkFilters, cosmeticFilters, errors } = normalizeFilters(text, {
    trustedScriptlets,
  });

  const result = updateEngine(
    [
      ...(__PLATFORM__ === 'firefox' ? networkFilters : []),
      ...cosmeticFilters,
    ].join('\n'),
  );

  result.errors = errors;

  if (__PLATFORM__ !== 'firefox') {
    const dnrResult = await Promise.allSettled(
      [...networkFilters].map((filter) => convert(filter)),
    );

    const dnrRules = [];
    for (const result of dnrResult) {
      if (result.value.errors?.length) {
        errors.push(...result.value.errors);
      }

      dnrRules.push(...result.value.rules);
    }

    result.dnrRules = await updateDNRRules(dnrRules);
  }

  return result;
}

observe('customFilters', async ({ enabled, trustedScriptlets }, lastValue) => {
  await initializedMainEngine;

  // Background startup
  if (!lastValue) {
    // If custom filters are disabled, we don't care if engine was reloaded
    // as custom filters should be empty
    if (!enabled) return;

    // If we cannot initialize engine, we need to update it
    if (!(await engines.init(engines.CUSTOM_ENGINE))) {
      update((await store.resolve(CustomFilters)).text, { trustedScriptlets });
    }
  } else {
    // If only trustedScriptlets has changed, we don't update automatically.
    // The user needs to click the update button.
    if (lastValue.enabled === enabled) {
      return;
    }

    update(enabled ? (await store.resolve(CustomFilters)).text : '', {
      trustedScriptlets,
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'customFilters:update') {
    store.resolve(Options).then((options) => {
      // Update filters
      update(msg.input, options.customFilters).then(sendResponse);
    });

    return true;
  }
});
