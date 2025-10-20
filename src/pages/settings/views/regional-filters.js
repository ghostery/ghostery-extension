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

import * as labels from '/ui/labels.js';
import Options from '/store/options.js';
import REGIONS from '/utils/regions.js';

function setRegion(id) {
  return ({ options }, event) => {
    const set = new Set(options.regionalFilters.regions);

    if (event.target.checked) {
      set.add(id);
    } else {
      set.delete(id);
    }

    store.set(options, { regionalFilters: { regions: [...set].sort() } });
  };
}

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
              <ui-text type="headline-m">Regional Filters</ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="secondary">
                Blocks additional ads, trackers, and pop-ups specific to the
                language of websites you visit. Enable only the languages you
                need to avoid slowing down your browser.
              </ui-text>
            </div>
            <settings-card type="content">
              <ui-toggle
                value="${options.regionalFilters.enabled}"
                onchange="${html.set(options, 'regionalFilters.enabled')}"
                data-qa="toggle:regional-filters"
              >
                <div layout="column grow gap:0.5">
                  <div layout="row gap items:center">
                    <ui-icon
                      name="pin"
                      color="quaternary"
                      layout="size:3"
                    ></ui-icon>
                    <ui-text type="headline-xs">Regional Filters</ui-text>
                  </div>
                </div>
              </ui-toggle>
            </settings-card>
            ${options.regionalFilters.enabled &&
            html`
              <div layout="grid:repeat(auto-fill,minmax(140px,1fr)) gap:1:0.5">
                ${REGIONS.map(
                  (id) => html`
                    <label
                      layout="row gap items:center ::user-select:none padding:0.5"
                    >
                      <ui-input>
                        <input
                          type="checkbox"
                          disabled="${!options.regionalFilters.enabled}"
                          checked="${options.regionalFilters.regions.includes(
                            id,
                          )}"
                          onchange="${setRegion(id)}"
                          data-qa="checkbox:regional-filters:${id}"
                        />
                      </ui-input>
                      <ui-text type="body-s" color="secondary">
                        ${labels.languages.of(id.toUpperCase())} (${id})
                      </ui-text>
                    </label>
                  `,
                )}
              </div>
            `}
          </section>
        `}
      </settings-page-layout>
    </template>
  `,
};
