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
import convert from '../dnr-converter.js';
import { getDNRRules } from '/utils/custom-filters.js';
import CustomFiltersInput from '../store/custom-filters-input.js';

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
          filters.networkFilters.push(filter);
        } else if (filterType === 2) {
          // COSMETIC
          filters.cosmeticFilters.push(filter);
        } else {
          filters.errors.push(`Filter not supported: '${filter}'`);
        }
        return filters;
      },
      {
        networkFilters: [],
        cosmeticFilters: [],
        errors: [],
      },
    );
}

async function onSave(host) {
  const { networkFilters, cosmeticFilters } = host.filters;
  const dnrRules = [];
  const dnrErrors = [];

  const results = await Promise.allSettled(
    networkFilters.map((filter) => convert(filter)),
  );

  for (const result of results) {
    dnrErrors.push(...result.value.errors);
    dnrRules.push(...result.value.rules);
  }

  host.dnrErrors = dnrErrors;

  // DNR validation is not required for Firefox, but it wont harm
  if (!dnrErrors.length) {
    store.submit(host.input);
    if (__PLATFORM__ === 'firefox') {
      await chrome.runtime.sendMessage({
        action: 'custom-filters:update-network',
        networkFilters,
      });
    } else {
      host.dnrRules = await chrome.runtime.sendMessage({
        action: 'custom-filters:update-dnr',
        dnrRules,
      });
    }

    await chrome.runtime.sendMessage({
      action: 'custom-filters:update-cosmetic',
      cosmeticFilters,
    });
  }
}

export default {
  input: store(CustomFiltersInput, { draft: true }),
  dnrRules: {
    value: undefined,
    connect: (host, key) => {
      getDNRRules().then((dnrRules) => {
        host[key] = dnrRules;
      });
    },
  },
  filters: ({ input }) => parseFilters(store.ready(input) ? input.text : ''),
  dnrErrors: undefined,
  errors: ({ filters, dnrErrors = [] }) => [...filters.errors, ...dnrErrors],
  content: ({ input, filters, dnrRules, errors }) => html`
    <template layout="column gap:3">
      ${store.ready(input) &&
      html`
        <textarea rows="10" oninput="${html.set(input, 'text')}">
${input.text}</textarea
        >
      `}
      <div layout="row gap items:center">
        <ui-button
          size="small"
          type=${errors.length > 0 ? 'outline-error' : 'outline'}
          disabled=${errors.length > 0}
          onclick="${onSave}"
          layout="shrink:0"
        >
          <a>Update</a>
        </ui-button>
      </div>
      <section layout="gap items:center">
        <h4>Errors</h4>
        <ul>
          ${errors.map(
            (error) =>
              html`<li>
                <ui-text color="danger-500">${error}</ui-text>
              </li>`,
          )}
        </ul>
        <h4>Filters</h4>
        <div>Network filters: ${filters.networkFilters.length}</div>
        <div>Cosmetic filters: ${filters.cosmeticFilters.length}</div>
        <div>Filter errors: ${filters.errors.length}</div>
        ${dnrRules &&
        html`
          <h4>Output</h4>
          <div>DNR rules: ${dnrRules.length}</div>
          <ul>
            ${dnrRules.map(
              (rule) => html`<li>${JSON.stringify(rule, null, 2)}</li>`,
            )}
          </ul>
        `},
      </section>
    </template>
  `,
};
