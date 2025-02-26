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

import { html, store, router, msg } from 'hybrids';

import Options from '/store/options.js';
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
  options: store(Options),
  input: store(CustomFilters, { draft: true }),
  result: undefined,
  render: ({ options, input, result }) => html`
    <template layout="contents">
      <settings-page-layout layout="column gap:4">
        ${store.ready(options) &&
        html`
          <section layout="column gap:4">
            <div layout="column gap" layout@992px="margin:bottom">
              <ui-action>
                <a
                  href="${router.backUrl()}"
                  layout="self:start padding"
                  data-qa="button:back"
                >
                  <ui-text type="label-s" layout="row gap items:center">
                    <ui-icon name="chevron-left"></ui-icon> Back
                  </ui-text>
                </a>
              </ui-action>
              <ui-text type="headline-m">Custom Filters</ui-text>
              <div layout="column gap:0.5">
                <ui-text type="body-l" mobile-type="body-m" color="secondary">
                  Facilitates the creation of your own ad-blocking rules to
                  customize your Ghostery experience.
                </ui-text>
                <ui-text type="label-s" color="secondary" underline>
                  <a
                    href="https://github.com/ghostery/adblocker/wiki/Compatibility-Matrix"
                    target="_blank"
                    rel="noreferrer"
                    layout="row gap:0.5"
                  >
                    Learn more on supported syntax
                    <ui-icon name="chevron-right-s"></ui-icon>
                  </a>
                </ui-text>
              </div>
            </div>
            <settings-card in-content>
              <ui-toggle
                value="${options.customFilters.enabled}"
                onchange="${html.set(options, 'customFilters.enabled')}"
              >
                <div layout="column grow gap:0.5">
                  <div layout="row gap items:center">
                    <ui-icon
                      name="flask"
                      color="quaternary"
                      layout="size:3"
                    ></ui-icon>
                    <ui-text type="headline-xs">
                      <!-- Enable "feature name" -->
                      Enable ${msg`Custom Filters`}
                    </ui-text>
                  </div>
                </div>
              </ui-toggle>
            </settings-card>
            ${options.customFilters.enabled &&
            html`
              <div layout="column gap:2">
                <label layout="row gap items:center ::user-select:none">
                  <ui-input>
                    <input
                      type="checkbox"
                      checked="${options.customFilters.trustedScriptlets}"
                      onchange="${html.set(
                        options,
                        'customFilters.trustedScriptlets',
                      )}"
                      data-qa="checkbox:custom-filters:trusted-scriptlets"
                    />
                  </ui-input>
                  <ui-text type="body-s">Allow trusted scriptlets</ui-text>
                </label>
                <ui-input>
                  <textarea
                    rows="10"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    oninput="${html.set(input, 'text')}"
                    disabled="${!store.ready(input)}"
                    defaultValue="${store.ready(input) ? input.text : ''}"
                    data-qa="input:custom-filters"
                  ></textarea>
                </ui-input>

                <ui-button
                  layout="self:start"
                  onclick="${update}"
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
                                      // prettier-ignore
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
            `}
          </section>
        `}
      </settings-page-layout>
    </template>
  `,
};
