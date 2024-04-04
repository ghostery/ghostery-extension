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
import { detectFilterType } from '@cliqz/adblocker';

import * as converter from '/utils/dnr-converter.js';
import CustomFiltersInput from '../store/custom-filters-input.js';
import { asyncAction } from './devtools.js';

function parseFilters(text = '') {
  return text
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)
    .reduce(
      (filters, filter) => {
        const filterType = detectFilterType(filter);
        if (filterType === 1) {
          // NETWORK
          filters.networkFilters.add(filter);
        } else if (filterType === 2) {
          // COSMETIC
          filters.cosmeticFilters.add(filter);
        } else {
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
  const { networkFilters, cosmeticFilters } = host.filters;

  // Update DNR
  if (__PLATFORM__ !== 'firefox') {
    const dnrRules = [];
    const dnrErrors = [];
    const results = await Promise.allSettled(
      [...networkFilters].map((filter) => converter.convert(filter)),
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
  await chrome.runtime.sendMessage({
    action: 'customFilters:engine',
    filters: [...networkFilters, ...cosmeticFilters].join('\n'),
  });

  // Save input
  await store.submit(host.input);
}

function update(host, event) {
  asyncAction(
    event,
    submitFilters(host).then(() => 'Filters updated'),
  );
}

export default {
  input: store(CustomFiltersInput, { draft: true }),
  dnrRules: undefined,
  filters: ({ input }) => parseFilters(store.ready(input) ? input.text : ''),
  dnrErrors: undefined,
  errors: ({ filters, dnrErrors = [] }) => [...filters.errors, ...dnrErrors],
  content: ({ input, filters, dnrRules, errors }) => html`
    <template layout="block">
      <div layout="column gap" translate="no">
        ${store.ready(input) &&
        // prettier-ignore
        html`
        <gh-settings-input>
          <textarea rows="10" oninput="${html.set(input, 'text')}">${input.text}</textarea>
        <gh-settings-input>
      `}
        <div layout="row content:space-around">
          <ui-text type="body-xs" color="gray-400">
            Network filters: ${filters.networkFilters.size}
          </ui-text>
          <ui-text type="body-xs" color="gray-400">
            Cosmetic filters: ${filters.cosmeticFilters.size}
          </ui-text>
        </div>
        ${!!errors.length &&
        html`
          <div layout="column gap:0.5" translate="no">
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
          <button>Update</button>
        </ui-button>

        ${!!dnrRules?.length &&
        html`
          <details>
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
