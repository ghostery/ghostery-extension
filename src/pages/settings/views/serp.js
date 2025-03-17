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

export default {
  options: store(Options),
  render: ({ options }) => html`
    <template layout="contents">
      <settings-page-layout layout="column gap:4">
        ${store.ready(options) &&
        html`
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
              <ui-text type="headline-m">
                Search Engine Redirect Protection
              </ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="secondary">
                Prevents Google from redirecting search result links through
                their servers instead of linking directly to pages.
              </ui-text>
            </div>
            <settings-card in-content>
              <ui-toggle
                value="${options.serpTrackingPrevention}"
                onchange="${html.set(options, 'serpTrackingPrevention')}"
              >
                <div layout="column grow gap:0.5">
                  <div layout="row gap items:center">
                    <ui-icon
                      name="search"
                      color="quaternary"
                      layout="size:3"
                    ></ui-icon>
                    <ui-text type="headline-xs">
                      <!-- Enable "feature name" -->
                      Enable ${msg`Search Engine Redirect Protection`}
                    </ui-text>
                  </div>
                </div>
              </ui-toggle>
            </settings-card>
          </section>
        `}
      </settings-page-layout>
    </template>
  `,
};
