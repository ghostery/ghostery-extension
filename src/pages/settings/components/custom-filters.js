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

import CustomFilters from '/store/custom-filters.js';

async function update(host, event) {
  const button = event.currentTarget;

  button.disabled = true;
  host.result = undefined;

  try {
    store.submit(host.input);

    host.result = await chrome.runtime.sendMessage({
      action: 'customFilters:update',
      input: host.input.text,
    });
  } finally {
    button.disabled = false;
  }
}

export default {
  input: store(CustomFilters, { draft: true }),
  disabled: false,
  result: undefined,
  render: ({ input, result, disabled }) => html`
    <template layout="block">
      <div layout="column gap">
        <ui-input>
          <textarea
            rows="10"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            oninput="${html.set(input, 'text')}"
            disabled="${!store.ready(input) || disabled}"
            defaultValue="${store.ready(input) ? input.text : ''}"
            data-qa="input:custom-filters"
          ></textarea>
        </ui-input>

        <ui-button
          layout="self:start"
          onclick="${update}"
          disabled="${disabled}"
          data-qa="button:custom-filters:save"
        >
          <button>Save</button>
        </ui-button>
        ${result &&
        html`
          <div
            layout="column gap margin:top"
            data-qa="component:custom-filters:result"
          >
            <div layout="column gap:0.5">
              <ui-text type="label-s" color="secondary">
                Custom filters have been updated
              </ui-text>
              <ui-text type="body-s" color="secondary">
                ${__PLATFORM__ === 'firefox'
                  ? html`Network filters: ${result.networkFilters || 0} `
                  : html`
                      <details>
                        <summary>
                          <ui-text
                            type="body-s"
                            layout="inline"
                            color="secondary"
                          >
                            DNR rules: ${result.dnrRules.length}
                          </ui-text>
                        </summary>
                        <ui-text type="body-s" color="secondary">
                          ${result.dnrRules.map(
                            (rule) =>
                              html`<pre>${JSON.stringify(rule, null, 2)}</pre>`,
                          )}
                        </ui-text>
                      </details>
                    `}
              </ui-text>
              <ui-text type="body-s" color="secondary">
                Cosmetic filters: ${result.cosmeticFilters || 0}
              </ui-text>
            </div>
          </div>
        `}
        ${!!result?.errors.length &&
        html`
          <div layout="column gap:0.5">
            <ui-text type="label-s" color="secondary">
              Errors (${result.errors.length})
            </ui-text>
            ${result?.errors.map(
              (error) =>
                html`<ui-text type="body-s" color="danger-secondary">
                  ${error}
                </ui-text>`,
            )}
          </div>
        `}
      </div>
    </template>
  `,
};
