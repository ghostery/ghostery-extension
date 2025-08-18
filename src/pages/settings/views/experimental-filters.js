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
              <ui-text type="headline-m">Experimental Filters</ui-text>
              <div layout="column gap:0.5">
                <ui-text type="body-l" mobile-type="body-m" color="secondary">
                  Helps Ghostery fix broken pages faster. By activating you can
                  test experimental filters and support us with feedback. Please
                  send a message to support@ghostery.com describing how your
                  experience changed after enabling.
                </ui-text>
                <ui-text type="label-s" color="secondary" underline>
                  <a
                    href="https://github.com/ghostery/broken-page-reports/blob/main/filters/experimental.txt"
                    target="_blank"
                    rel="noreferrer"
                    layout="row gap:0.5"
                  >
                    Learn more
                    <ui-icon name="arrow-right-s"></ui-icon>
                  </a>
                </ui-text>
              </div>
            </div>
            <settings-card in-content>
              <ui-toggle
                value="${options.experimentalFilters}"
                onchange="${html.set(options, 'experimentalFilters')}"
              >
                <div layout="column grow gap:0.5">
                  <div layout="row gap items:center">
                    <ui-icon
                      name="flask"
                      color="quaternary"
                      layout="size:3"
                    ></ui-icon>
                    <ui-text type="headline-xs">Experimental Filters</ui-text>
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
