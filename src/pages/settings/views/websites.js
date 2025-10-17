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

import Options, { GLOBAL_PAUSE_ID } from '/store/options.js';
import ElementPickerSelectors from '/store/element-picker-selectors.js';

import NoWebsitesSVG from '../assets/no_websites.svg';

import WebsiteDetails from './website-details.js';
import WebsitesAdd from './websites-add.js';
import Config, { ACTION_PAUSE_ASSISTANT } from '/store/config.js';

function revokeCallback(item) {
  return ({ options }, event) => {
    event.preventDefault();
    event.stopPropagation();

    const exceptions = Array.from(item.exceptions).reduce((acc, id) => {
      const exception = options.exceptions[id];
      const domains = exception.domains.filter((d) => d !== item.id);

      acc[id] =
        exception.global || domains.length > 0
          ? { ...exception, domains }
          : null;

      return acc;
    }, {});

    store.set(ElementPickerSelectors, { hostnames: { [item.id]: null } });
    store.set(options, { paused: { [item.id]: null }, exceptions });
  };
}

export default {
  [router.connect]: { stack: [WebsiteDetails, WebsitesAdd] },
  config: store(Config),
  options: store(Options),
  elementPickerSelectors: store(ElementPickerSelectors),
  query: '',
  websites: ({ config, options, elementPickerSelectors, query }) => {
    if (!store.ready(config, options, elementPickerSelectors)) return [];

    query = query.toLowerCase().trim();

    const websites = Object.entries(options.paused)
      .filter(({ id }) => id !== GLOBAL_PAUSE_ID)
      .filter(
        ([id, { assist }]) =>
          // Only show assisted domains if the action is enabled
          !assist || (assist && config.hasAction(id, ACTION_PAUSE_ASSISTANT)),
      )
      .map(([id, { revokeAt, assist, managed }]) => ({
        id,
        revokeAt,
        assist,
        managed,
        exceptions: new Set(),
        counter: 0,
      }));

    // Add custom content blocks
    Object.entries(elementPickerSelectors.hostnames).forEach(
      ([domain, list]) => {
        const website = websites.find((e) => e.id === domain);
        if (website) {
          website.counter += list.length;
        } else {
          websites.push({
            id: domain,
            exceptions: new Set(),
            counter: list.length,
          });
        }
      },
    );

    Object.entries(options.exceptions).forEach(([id, { domains }]) => {
      domains.forEach((domain) => {
        const website = websites.find((e) => e.id === domain);
        if (website) {
          website.exceptions.add(id);
          website.counter += 1;
        } else {
          websites.push({
            id: domain,
            exceptions: new Set([id]),
            counter: 1,
          });
        }
      });
    });

    return websites
      .filter(({ id }) => id.includes(query))
      .sort((a, b) => {
        // Sort by assist flag first (without flag first)
        if (a.assist !== b.assist) return Number(a.assist) - Number(b.assist);

        // Then sort alphabetically by id
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
      });
  },
  render: ({ websites, query }) => html`
    <template layout="contents">
      <settings-page-layout layout="gap:4">
        <div layout="column gap" layout@992px="margin:bottom">
          <div layout="row items:center content:space-between">
            <ui-text type="headline-m">Websites</ui-text>
          </div>
          <ui-text type="body-l" mobile-type="body-m" color="secondary">
            All websites with adjusted protection status will be listed here.
          </ui-text>
        </div>
        <section layout="column gap:4" layout@768px="gap:5">
          <div layout="row items:center gap:2">
            <ui-input icon="search" layout="grow:1">
              <input
                type="search"
                value="${query}"
                placeholder="${msg`Search website...`}"
                oninput="${html.set('query')}"
              />
            </ui-input>
            <ui-button>
              <a href="${router.url(WebsitesAdd)}">Add</a>
            </ui-button>
          </div>
          ${websites.length
            ? html`
                <settings-table responsive>
                  <div
                    slot="header"
                    layout="column"
                    layout@768px="grid:3fr|3fr|1fr|60px gap:4"
                  >
                    <ui-text type="label-m">
                      Website <span>(${websites.length})</span>
                    </ui-text>
                    <ui-text
                      type="label-m"
                      layout="hidden"
                      layout@768px="block"
                    >
                      Protection status
                    </ui-text>
                    <ui-text
                      type="label-m"
                      layout="hidden"
                      layout@768px="block"
                    >
                      Exceptions
                    </ui-text>
                  </div>
                  ${websites.map(
                    (item) => html`
                      <ui-action layout="block">
                        <a
                          href="${router.url(WebsiteDetails, {
                            domain: item.id,
                          })}"
                          layout="grid:1|min:auto gap:2 items:center:stretch margin:-2:0 padding:2:0"
                          layout@768px="grid:3fr|3fr|1fr|60px gap:4"
                        >
                          <ui-text type="label-l" ellipsis>
                            ${item.id}
                          </ui-text>
                          ${!item.managed &&
                          html`
                            <ui-action>
                              <button
                                layout@768px="order:1"
                                onclick="${revokeCallback(item)}"
                              >
                                <ui-icon
                                  name="trash"
                                  layout="size:3"
                                  color="tertiary"
                                ></ui-icon>
                              </button>
                            </ui-action>
                          `}
                          <ui-line
                            layout="area:2"
                            layout@768px="hidden"
                          ></ui-line>
                          <settings-protection-status
                            layout@768px="grow"
                            revokeAt="${item.revokeAt}"
                            assist="${item.assist}"
                          ></settings-protection-status>
                          <div
                            layout="row items:center gap self:center"
                            layout@768px="grow self:auto"
                          >
                            <ui-text type="label-m">
                              ${item.counter || ''}
                            </ui-text>
                          </div>
                        </a>
                      </ui-action>
                    `,
                  )}
                </settings-table>
              `
            : !query &&
              html`
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
      </settings-page-layout>
    </template>
  `,
};
