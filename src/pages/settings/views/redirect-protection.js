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

import { html, store, router } from 'hybrids';

import Options from '/store/options.js';
import RedirectProtectionAddException from './redirect-protection-add-exception.js';

function removeException(hostname) {
  return ({ options }) => {
    store.set(options, {
      redirectProtection: {
        disabled: { [hostname]: null },
      },
    });
  };
}

export default {
  [router.connect]: {
    stack: [RedirectProtectionAddException],
  },
  options: store(Options),
  render: ({ options }) => html`
    <template layout="contents">
      <settings-page-layout layout="column gap:4">
        <section layout="column gap:4">
          <div layout="column gap" layout@992px="margin:bottom">
            <settings-link
              href="${router.backUrl()}"
              data-qa="button:back"
              layout="self:start"
            >
              <ui-icon name="chevron-left" color="primary"></ui-icon>
              <ui-text type="headline-s" layout="row gap items:center">
                Back
              </ui-text>
            </settings-link>
            <ui-text type="headline-m">Redirect Tracking Protection</ui-text>
            <ui-text type="body-l" mobile-type="body-m" color="secondary">
              Ghostery blocks redirects to known tracking domains and shows a
              warning page instead. You can choose to proceed or go back. Add
              exceptions below for domains you trust.
            </ui-text>
          </div>
          <settings-card type="content">
            <ui-toggle
              value="${options.redirectProtection.enabled}"
              onchange="${html.set(options, 'redirectProtection.enabled')}"
              data-qa="toggle:redirect-protection"
            >
              <div layout="column grow gap:0.5">
                <div layout="row gap items:center">
                  <ui-icon
                    name="globe"
                    color="quaternary"
                    layout="size:3"
                  ></ui-icon>
                  <ui-text type="headline-xs">
                    Enable Redirect Tracking Protection
                  </ui-text>
                </div>
              </div>
            </ui-toggle>
          </settings-card>
          ${options.redirectProtection.enabled &&
          html`
            <div layout="column gap:2">
              <div layout="row content:space-between items:center">
                <ui-text type="label-m">Redirect exceptions</ui-text>
                <ui-button
                  type="primary"
                  size="s"
                  data-qa="button:redirect-protection:add"
                >
                  <a href="${router.url(RedirectProtectionAddException)}">
                    Add
                  </a>
                </ui-button>
              </div>
              ${Object.keys(options.redirectProtection.disabled).length
                ? html`
                    <settings-table>
                      <div slot="header" layout="grid:1|max gap">
                        <ui-text type="label-s" color="secondary">
                          Website
                          (${Object.keys(options.redirectProtection.disabled)
                            .length})
                        </ui-text>
                      </div>
                      ${Object.keys(options.redirectProtection.disabled).map(
                        (hostname) => html`
                          <div
                            layout="grid:1|max content:center gap"
                            data-qa="item:redirect-protection:exception:${hostname}"
                          >
                            <ui-text type="body-s">${hostname}</ui-text>
                            <ui-action>
                              <button
                                onclick="${removeException(hostname)}"
                                data-qa="button:redirect-protection:remove:${hostname}"
                              >
                                <ui-icon
                                  name="trash"
                                  color="danger-secondary"
                                  layout="size:2.5"
                                ></ui-icon>
                              </button>
                            </ui-action>
                          </div>
                        `,
                      )}
                    </settings-table>
                  `
                : html`
                    <settings-card
                      type="content"
                      layout="column center gap:2 padding:4"
                      data-qa="component:redirect-protection:empty-state"
                    >
                      <ui-icon
                        name="shield"
                        color="quaternary"
                        layout="size:4"
                      ></ui-icon>
                      <ui-text type="body-s" color="secondary">
                        No exceptions added yet
                      </ui-text>
                    </settings-card>
                  `}
            </div>
          `}
        </section>
      </settings-page-layout>
    </template>
  `,
};
