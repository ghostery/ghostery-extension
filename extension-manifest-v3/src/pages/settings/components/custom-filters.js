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

async function update(host) {
  host.result = undefined;

  store.submit(host.input);

  host.result = await chrome.runtime.sendMessage({
    action: 'customFilters:update',
    input: host.input.text,
  });
}

export default {
  storage: store(CustomFilters),
  input: store(CustomFilters, { draft: true }),
  result: undefined,
  render: ({ input, storage, result }) => html`
    <template layout="block">
      <div layout="column gap">
        <gh-settings-input>
          <textarea
            rows="10"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            oninput="${html.set(input, 'text')}"
            disabled="${!store.ready(input)}"
            defaultValue="${store.ready(input) ? input.text : ''}"
          ></textarea>
        </gh-settings-input>

        <ui-button
          layout="self:start"
          size="small"
          type="outline"
          disabled=${!store.ready(storage) || input.text === storage.text}
          onclick="${update}"
        >
          <button>Update</button>
        </ui-button>
        ${result &&
        html`
          <div layout="column gap margin:top">
            <div layout="column gap:0.5">
              <ui-text type="label-s" color="gray-500">
                Custom filters has been updated
              </ui-text>
              <ui-text type="body-s" color="gray-500">
                ${__PLATFORM__ === 'firefox'
                  ? html`Network filters: ${result.networkFilters || 0} `
                  : html`
                      <details translate="no">
                        <summary>
                          <ui-text
                            type="body-s"
                            layout="inline"
                            color="gray-500"
                          >
                            DNR rules: ${result.dnrRules.length}
                          </ui-text>
                        </summary>
                        <ui-text type="body-s" color="gray-500">
                          ${result.dnrRules.map(
                            (rule) =>
                              html`<pre>${JSON.stringify(rule, null, 2)}</pre>`,
                          )}
                        </ui-text>
                      </details>
                    `}
              </ui-text>
              <ui-text type="body-s" color="gray-500">
                Cosmetic filters: ${result.cosmeticFilters || 0}
              </ui-text>
            </div>
          </div>
        `}
        ${!!result?.errors.length &&
        html`
          <div layout="column gap:0.5">
            <ui-text type="label-s" color="danger-500">
              Errors (${result.errors.length})
            </ui-text>
            ${result?.errors.map(
              (error) =>
                html`<ui-text type="body-xs" color="danger-500">
                  ${error}
                </ui-text>`,
            )}
          </div>
        `}
      </div>
    </template>
  `,
};
