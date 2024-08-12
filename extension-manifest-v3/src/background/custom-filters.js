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

function parseInput(text = '', { trustedScriptlets }) {
  return text
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)
    .reduce(
      (filters, filter) => {
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
                `Trusted scriptlets are not allowed: '${filter}'`,
              );
            } else {
              console.error(e);
            }
          }
        } else if (filterType === FilterType.NOT_SUPPORTED_ADGUARD) {
          filters.errors.push(`Filter not supported: '${filter}'`);
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
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: dnrRules.map((rule, index) => ({
        ...rule,
        id: 1000000 + index,
      })),
    });

    console.info(`Custom Filters: DNR updated with rules: ${dnrRules.length}`);
  }
}

function updateEngine(text) {
  const {
    networkFilters,
    cosmeticFilters,
    preprocessors,
    notSupportedFilters,
  } = parseFilters(text);

  engines.createEngine(engines.CUSTOM_ENGINE, {
    cosmeticFilters,
    networkFilters,
    preprocessors,
  });

  console.info(
    `Custom Filters: Engine updated with network filters: ${networkFilters.length}, cosmetic filters: ${cosmeticFilters.length}`,
  );

  return {
    networkFilters: networkFilters.length,
    cosmeticFilters: cosmeticFilters.length,
    errors: notSupportedFilters.map(
      (msg) => `Filter not supported: '${msg.filter}'`,
    ),
  };
}
async function update(text, { trustedScriptlets }) {
  const parseResult = parseInput(text, { trustedScriptlets });

  const engineResult = updateEngine(
    [
      ...(__PLATFORM__ === 'firefox' ? parseResult.networkFilters : []),
      ...parseResult.cosmeticFilters,
    ].join('\n'),
  );

  const errors = [...parseResult.errors, ...engineResult.errors];
  const dnrRules = [];

  if (__PLATFORM__ !== 'firefox') {
    const dnrResult = await Promise.allSettled(
      [...parseResult.networkFilters].map((filter) => convert(filter)),
    );

    for (const result of dnrResult) {
      if (result.value.errors?.length) {
        errors.push(...result.value.errors);
      }

      dnrRules.push(...result.value.rules);
    }

    updateDNRRules(dnrRules);
  }

  return {
    networkFilters: engineResult.networkFilters,
    cosmeticFilters: engineResult.cosmeticFilters,
    dnrRules,
    errors,
  };
}

observe('customFilters', async ({ enabled, trustedScriptlets }, lastValue) => {
  if (!lastValue) return;

  const { text } = await store.resolve(CustomFilters);
  update(enabled ? text : '', { trustedScriptlets });
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
