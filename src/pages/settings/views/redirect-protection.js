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

import { html, msg, store, router } from 'hybrids';

import Options from '/store/options.js';
import RedirectProtectionAddException from './redirect-protection-add-exception.js';

function removeException(hostname) {
  return ({ options }) => {
    store.set(options, {
      redirectProtection: { exceptions: { [hostname]: null } },
    });
  };
}

export function getRedirectProtectionLabel(options) {
  const labels = [];

  if (options.serpTrackingPrevention) {
    labels.push(msg`Search Engine Redirect Protection`);
  }

  if (options.redirectProtection.enabled) {
    labels.push(msg`Browser Redirect Protection`);
  }

  if (!labels.length) {
    return msg`No options are currently enabled`;
  }

  return msg`Enabled: ${labels.join(', ')}`;
}

export default {
  [router.connect]: {
    stack: [RedirectProtectionAddException],
  },
  options: store(Options),
  hostnames: ({ options }) => Object.keys(options.redirectProtection.exceptions),
  render: ({ options, hostnames }) => html`
    <template layout="contents">
      <settings-page-layout layout="column gap:4">
        <section layout="column gap:4">
          <div layout="column gap" layout@992px="margin:bottom">
            <settings-back-button></settings-back-button>
            <ui-text type="headline-m">Redirect Protection</ui-text>
            <ui-text type="body-l" mobile-type="body-m" color="secondary">
              Ensures your clicks go directly to the pages you select, without unnecessary tracking
              detours.
            </ui-text>
          </div>
          <div layout="column gap">
            <settings-toggle
              value="${options.redirectProtection.enabled}"
              icon="globe-lock"
              onchange="${html.set(options, 'redirectProtection.enabled')}"
              data-qa="toggle:redirect-protection"
            >
              Browser Redirect Protection
              <span slot="description">
                Prevents websites from redirecting your clicks through tracking URLs before loading
                the destination pages.
              </span>
              ${options.redirectProtection.enabled &&
              html`
                <div slot="card-footer" layout="column gap:2">
                  <div layout="row content:space-between items:center">
                    <ui-text type="label-l">Exceptions</ui-text>
                    <ui-button data-qa="button:redirect-protection:add">
                      <a href="${router.url(RedirectProtectionAddException)}"> Add </a>
                    </ui-button>
                  </div>

                  <settings-table>
                    <div slot="header" layout="grid:1|max gap">
                      <ui-text type="label-m">
                        Website <span>${!!hostnames.length && html`(${hostnames.length})`}</span>
                      </ui-text>
                    </div>
                    ${hostnames.length
                      ? hostnames.map(
                          (hostname) => html`
                            <div
                              layout="grid:1|max content:center gap"
                              data-qa="item:redirect-protection:exception:${hostname}"
                            >
                              <ui-text type="label-m">${hostname}</ui-text>
                              <ui-action>
                                <button
                                  onclick="${removeException(hostname)}"
                                  data-qa="button:redirect-protection:remove:${hostname}"
                                >
                                  <ui-icon name="trash" color="tertiary" layout="size:3"></ui-icon>
                                </button>
                              </ui-action>
                            </div>
                          `,
                        )
                      : html`
                          <div
                            layout="column center gap padding:3:0"
                            data-qa="component:redirect-protection:empty-state"
                          >
                            <ui-icon name="block-m" color="tertiary" layout="size:3"></ui-icon>
                            <ui-text color="tertiary" layout="block:center width:::180px">
                              No exceptions added yet
                            </ui-text>
                          </div>
                        `}
                  </settings-table>
                </div>
              `}
            </settings-toggle>
            <settings-toggle
              value="${options.serpTrackingPrevention}"
              icon="search"
              onchange="${html.set(options, 'serpTrackingPrevention')}"
            >
              Search Engine Redirect Protection
              <span slot="description">
                Prevents Google and Bing from redirecting search result links through their servers
                instead of linking directly to pages.
              </span>
            </settings-toggle>
          </div>
        </section>
      </settings-page-layout>
    </template>
  `,
};
