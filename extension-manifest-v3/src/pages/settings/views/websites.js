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
import TrackerException from '/store/tracker-exception.js';

import NoWebsitesSVG from '../assets/no_websites.svg';

import WebsiteDetails from './website-details.js';
import WebsitesAdd from './websites-add.js';

function revoke(host, item) {
  if (item.exceptions) {
    for (const exception of item.exceptions) {
      store.set(exception, {
        blockedDomains: exception.blockedDomains.filter((d) => d !== item.id),
        trustedDomains: exception.trustedDomains.filter((d) => d !== item.id),
      });
    }
  }

  store.set(host.options, { paused: { [item.id]: null } });
}

function revokeCallback(item) {
  return (host, event) => {
    event.preventDefault();
    event.stopPropagation();

    revoke(host, item);
  };
}

export default {
  [router.connect]: { stack: [WebsiteDetails, WebsitesAdd] },
  options: store(Options),
  query: '',
  exceptions: () => {
    const exceptions = store.get([TrackerException]);
    if (!store.ready(exceptions)) return [];

    const domains = new Map();

    for (const exception of exceptions) {
      for (const domain of exception.blockedDomains.concat(
        exception.trustedDomains,
      )) {
        if (!domains.has(domain)) {
          domains.set(domain, new Set([exception]));
        } else {
          const set = domains.get(domain);
          set.add(exception);
        }
      }
    }

    return [...domains.entries()];
  },
  websites: ({ options, exceptions, query }) => {
    const paused = store.ready(options)
      ? Object.entries(options.paused).map(([id, { revokeAt }]) => ({
          id,
          revokeAt,
        }))
      : [];

    query = query.toLowerCase().trim();

    return [
      ...paused
        .filter(({ id }) => id !== GLOBAL_PAUSE_ID)
        .filter(({ id }) => !exceptions.some(([d]) => d === id)),
      ...exceptions.map(([d, exceptions]) => ({
        id: d,
        revokeAt: paused.find((p) => p.id === d)?.revokeAt,
        exceptions,
      })),
    ].filter((item) => item.id.includes(query));
  },
  render: ({ websites, query }) => html`
    <template layout="contents">
      <gh-settings-page-layout layout="gap:4">
        <div layout="column gap" layout@992px="margin:bottom">
          <div layout="row items:center content:space-between">
            <ui-text type="headline-m">Websites</ui-text>
          </div>
          <ui-text type="body-l" mobile-type="body-m" color="gray-600">
            All websites with adjusted protection status will be listed here.
          </ui-text>
        </div>
        <section layout="column gap:4" layout@768px="gap:5">
          <div layout="row items:center gap:2">
            <gh-settings-input icon="search" layout="grow:1">
              <input
                type="search"
                value="${query}"
                placeholder="${msg`Search website...`}"
                oninput="${html.set('query')}"
              />
            </gh-settings-input>
            <ui-button size="small">
              <a href="${router.url(WebsitesAdd)}">Add</a>
            </ui-button>
          </div>
          ${websites.length
            ? html`
                <gh-settings-table responsive>
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
                          <ui-action>
                            <button
                              layout@768px="order:1"
                              onclick="${revokeCallback(item)}"
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
                          <gh-settings-protection-status
                            layout@768px="grow"
                            revokeAt="${item.revokeAt}"
                          ></gh-settings-protection-status>
                          <div
                            layout="row items:center gap self:center"
                            layout@768px="grow self:auto"
                          >
                            <ui-text type="label-m">
                              ${item.exceptions?.size}
                            </ui-text>
                          </div>
                        </a>
                      </ui-action>
                    `,
                  )}
                </gh-settings-table>
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
      </gh-settings-page-layout>
    </template>
  `,
};
