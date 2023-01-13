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

import { html, msg, store } from 'hybrids';
import '@github/relative-time-element';

import Options from '/store/options.js';
import NoWebsitesSVG from '../assets/no_websites.svg';

function revoke(item) {
  return (host) => {
    store.set(host.options, {
      paused: host.options.paused.filter((p) => p !== item),
    });
  };
}

function clearAll(host) {
  store.set(host.options, { paused: [] });
}

export default {
  options: store(Options),
  query: '',
  paused: ({ options }) => (store.ready(options) ? options.paused : []),
  websites: ({ paused, query }) => {
    query = query.toLowerCase().trim();
    return paused.filter((item) => item.id.includes(query));
  },
  content: ({ paused, websites }) => html`
    <template layout="block">
      <div layout="column gap:4">
        <div
          layout="row items:center content:space-between"
          layout@992px="margin:bottom"
        >
          <ui-text type="headline-l" mobile-type="headline-m">
            Websites
          </ui-text>
          ${!!paused.length &&
          html`
            <ui-button type="outline" size="small">
              <button onclick="${clearAll}">Clear all</button>
            </ui-button>
          `}
        </div>
        <section layout="column gap:4" layout@768px="gap:5">
          <ui-text type="headline-m" mobile-type="headline-s">
            Manage website settings
          </ui-text>
          ${paused.length
            ? html`
                <ui-settings-input icon="search" layout@1280px="width:::340px">
                  <input
                    type="search"
                    placeholder="${msg`Search website...`}"
                    oninput="${html.set('query')}"
                  />
                </ui-settings-input>
                <ui-settings-table>
                  <div
                    slot="header"
                    layout="column"
                    layout@768px="grid:2 gap:4"
                  >
                    <ui-text type="label-m" slot="header">
                      Website (${websites.length})
                    </ui-text>
                    <ui-text
                      type="label-m"
                      slot="header"
                      layout="hidden"
                      layout@768px="block"
                    >
                      Settings
                    </ui-text>
                  </div>
                  ${websites.map(
                    (item) => html`
                      <div
                        layout="grid:1|min:auto gap:2 items:center:stretch"
                        layout@768px="row"
                      >
                        <ui-text
                          type="label-l"
                          ellipsis
                          layout@768px="width:50%"
                        >
                          ${item.id}
                        </ui-text>
                        <ui-action>
                          <button
                            layout@768px="order:1"
                            onclick="${revoke(item)}"
                          >
                            <ui-icon
                              name="trash"
                              layout="size:3"
                              color="gray-400"
                            ></ui-icon>
                          </button>
                        </ui-action>
                        <ui-line
                          layout="area:2"
                          layout@768px="hidden"
                        ></ui-line>
                        <div layout="row items:center gap" layout@768px="grow">
                          <ui-settings-badge type="danger">
                            Paused
                          </ui-settings-badge>
                          <ui-text color="gray-600" layout="grow">
                            ${item.revokeAt
                              ? html`${html`<relative-time
                                  date="${new Date(item.revokeAt)}"
                                  format="duration"
                                  format-style="narrow"
                                  precision="minute"
                                  lang="${chrome.i18n.getUILanguage()}"
                                ></relative-time>`}
                                left`
                              : `Always`}
                          </ui-text>
                        </div>
                      </div>
                    `,
                  )}
                </ui-settings-table>
              `
            : html`
                <div
                  layout="block:center width:::400px margin:2:auto"
                  layout@768px="margin:top:7"
                >
                  <img
                    src="${NoWebsitesSVG}"
                    layout="margin:bottom:2 size:96px"
                    layout@768px="size:128px"
                  />
                  <ui-text
                    type="headline-m"
                    mobile-type="headline-s"
                    layout="margin:bottom:0.5"
                  >
                    No websites added
                  </ui-text>
                  <ui-text type="body-l" mobile-type="body-m" translate="no">
                    For websites to be listed here, you need to pause Ghostery
                    Privacy Protection in Ghostery Panel for a reason individual
                    to you.
                  </ui-text>
                </div>
              `}
        </section>
      </div>
    </template>
  `,
};
