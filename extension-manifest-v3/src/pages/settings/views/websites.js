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
    <template layout="contents">
      <gh-settings-page-layout layout="gap:4">
        <div layout="column gap" layout@992px="margin:bottom">
          <div layout="row items:center content:space-between">
            <ui-text type="headline-l" mobile-type="headline-m">
              Websites
            </ui-text>
            ${!!paused.length &&
            html`
              <gh-settings-button onclick="${clearAll}">
                Clear all
              </gh-settings-button>
            `}
          </div>
          <ui-text type="body-l" mobile-type="body-m" color="gray-600">
            When pausing Ghostery on individual websites, those websites will
            appear here.
          </ui-text>
        </div>
        <section layout="column gap:4" layout@768px="gap:5">
          ${paused.length
            ? html`
                <gh-settings-input icon="search" layout@1280px="width:::340px">
                  <input
                    type="search"
                    placeholder="${msg`Search website...`}"
                    oninput="${html.set('query')}"
                  />
                </gh-settings-input>
                <gh-settings-table>
                  <div
                    slot="header"
                    layout="column"
                    layout@768px="grid:2 gap:4"
                  >
                    <ui-text type="label-m">
                      Website <span>(${websites.length})</span>
                    </ui-text>
                    <ui-text
                      type="label-m"
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
                          <gh-settings-badge type="danger">
                            Paused
                          </gh-settings-badge>
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
                              : msg`Always`}
                          </ui-text>
                        </div>
                      </div>
                    `,
                  )}
                </gh-settings-table>
              `
            : html`
                <div
                  layout="block:center width:::400px margin:2:auto"
                  layout@768px="margin:top:4"
                >
                  <img
                    src="${NoWebsitesSVG}"
                    layout="size:96px"
                    layout@768px="size:128px"
                  />
                </div>
              `}
        </section>
      </gh-settings-page-layout>
    </template>
  `,
};
