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

import { html, store } from 'hybrids';
import { detectFilterType, FilterType, CosmeticFilter } from '@cliqz/adblocker';

import Options from '/store/options.js';
import { createDocumentConverter } from '/utils/dnr-converter.js';
import CustomFiltersInput from '../store/custom-filters-input.js';
import { asyncAction } from './devtools.js';

const convert = createDocumentConverter();

class TrustedScriptletError extends Error {}

// returns a scriptlet with encoded arguments
// returns undefined if not a scriptlet
// throws if scriptlet cannot be trusted
function fixScriptlet(filter, allowTrusted) {
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
    !allowTrusted &&
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

function parseFilters(text = '', { allowTrusted }) {
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
            const scriptlet = fixScriptlet(filter, allowTrusted);
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

async function submitFilters(host) {
  const { networkFilters } = host.filters;

  // Update DNR
  if (__PLATFORM__ !== 'firefox') {
    const dnrRules = [];
    const dnrErrors = [];
    const results = await Promise.allSettled(
      [...networkFilters].map((filter) => convert(filter)),
    );

    for (const result of results) {
      dnrErrors.push(...result.value.errors);
      dnrRules.push(...result.value.rules);
    }

    if (dnrErrors.length) {
      host.dnrErrors = dnrErrors;
      return;
    }

    await chrome.runtime.sendMessage({
      action: 'customFilters:dnr',
      dnrRules,
    });

    host.dnrRules = dnrRules;
  }

  // Update engine
  host.conversionErrors = await chrome.runtime.sendMessage({
    action: 'customFilters:engine',
    filters: host.input.text,
  });

  // Save input
  await store.submit(host.input);
}

function update(host, event) {
  host.dnrErrors = [];

  asyncAction(
    event,
    submitFilters(host).then(() => 'Filters updated'),
  );
}

export default {
  options: store(Options),
  input: store(CustomFiltersInput, { draft: true }),
  filters: ({ input, options }) =>
    parseFilters(store.ready(input) ? input.text : '', {
      allowTrusted: options.customFilters.trustedScriptlets,
    }),
  dnrRules: undefined,
  conversionErrors: undefined,
  dnrErrors: undefined,
  errors: ({ filters, dnrErrors = [], conversionErrors = [] }) => [
    ...filters.errors,
    ...dnrErrors,
    ...conversionErrors,
  ],
  render: ({ input, filters, dnrRules, errors }) => html`
    <template layout="block">
      <div layout="column gap">
        ${store.ready(input) &&
        // prettier-ignore
        html`
        <gh-settings-input>
          <textarea rows="10" oninput="${html.set(input, 'text')}">${input.text}</textarea>
        <gh-settings-input>
      `}
        <div layout="row content:space-around">
          <ui-text type="body-xs" color="gray-400">
            Network Filters: ${filters.networkFilters.size}
          </ui-text>
          <ui-text type="body-xs" color="gray-400">
            Cosmetic Filters: ${filters.cosmeticFilters.size}
          </ui-text>
        </div>
        ${!!errors.length &&
        html`
          <div layout="column gap:0.5">
            <ui-text type="label-s" color="danger-500">
              Errors (${errors.length}):
            </ui-text>
            ${errors.map(
              (error) =>
                html`<ui-text type="body-xs" color="danger-500">
                  ${error}
                </ui-text>`,
            )}
          </div>
        `}

        <ui-button
          layout="self:start"
          size="small"
          type="outline"
          disabled=${errors.length > 0}
          onclick="${update}"
        >
          <button>Update Filters</button>
        </ui-button>

        ${!!dnrRules?.length &&
        html`
          <details translate="no">
            <summary>
              <ui-text type="label-s" layout="inline">
                DNR Output (${dnrRules.length})
              </ui-text>
            </summary>
            <ui-text type="body-s" color="gray-500">
              ${dnrRules.map(
                (rule) => html`<pre>${JSON.stringify(rule, null, 2)}</pre>`,
              )}
            </ui-text>
          </details>
        `}
      </div>
    </template>
  `,
};
