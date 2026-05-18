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

import Options from '/store/options.js';

export function getDistractionsLabel(options) {
  return msg`Enabled rules: ${Object.values(options.distractions).filter(Boolean).length}`;
}

const DISTRACTIONS = [
  {
    id: 'google',
    title: msg`Sign in with Google`,
    domains: 'google.com',
    description: msg`Google's identity solution for one-tap or button login.`,
  },
  {
    id: 'reddit',
    title: msg`Open in app prompt`,
    domains: 'reddit.com',
    description: msg`Hide the mobile interstitial that pushes you to install the Reddit app instead of using the website.`,
  },
  {
    id: 'shorts',
    title: msg`Short videos`,
    domains: 'youtube.com instagram.com facebook.com',
    description: msg`Hide endless short-form video feeds like YouTube Shorts, Instagram Reels and Facebook Reels.`,
  },
  {
    id: 'browserPrompts',
    title: msg`Browser download prompts`,
    domains: 'google.com bing.com microsoft.com',
    description: msg`Hide "try our browser" banners that push Chrome, Edge, Firefox or Opera on sites like Bing, MSN, Microsoft and the Chrome Web Store.`,
  },
  {
    id: 'socialWidgets',
    title: msg`Social media widgets`,
    domains: 'facebook.com twitter.com linkedin.com pinterest.com',
    description: msg`Hide social share buttons and embedded Facebook, Twitter/X, LinkedIn, Pinterest and Instagram widgets across the web.`,
  },
];

function filterDistractions(query, filter, options) {
  const q = query.trim().toLowerCase();

  return DISTRACTIONS.filter((distraction) => {
    if (filter === 'enabled' && !options.distractions[distraction.id]) return false;
    if (filter === 'disabled' && options.distractions[distraction.id]) return false;

    if (!q) return true;

    const { title, domains, description } = distraction;
    return (
      title.toLowerCase().includes(q) ||
      domains.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q)
    );
  });
}

export default {
  options: store(Options),
  filter: '',
  query: '',
  distractions: ({ options, query, filter }) =>
    store.ready(options) ? filterDistractions(query, filter, options) : [],
  render: ({ options, filter, query, distractions }) => html`
    <template layout="contents">
      <settings-page-layout layout="column gap:4">
        ${store.ready(options) &&
        html`
          <section layout="column gap:5">
            <div layout="column gap" layout@992px="margin:bottom">
              <settings-back-button></settings-back-button>
              <ui-text type="headline-m">Distractions</ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="secondary">
                Remove intrusive prompts and interface clutter for a cleaner browsing experience.
              </ui-text>
            </div>
            <div layout="column gap" layout@425px="row">
              <ui-input>
                <select value="${filter}" onchange="${html.set('filter')}">
                  <option value="">Show all</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </ui-input>
              <ui-input icon="search" layout="grow:1">
                <input
                  type="search"
                  value="${query}"
                  placeholder="${msg`Search for domain or distractions...`}"
                  oninput="${html.set('query')}"
                />
              </ui-input>
            </div>

            <div layout="column gap:5">
              ${distractions.map(
                ({ id, title, domains, description }) => html`
                  <ui-toggle
                    value="${options.distractions[id]}"
                    onchange="${html.set(options, `distractions.${id}`)}"
                    data-qa="toggle:distractions:${id}"
                  >
                    <div layout="column gap:0.5">
                      <div layout="column gap:0.5">
                        <ui-text type="label-l">${title}</ui-text>
                        <ui-text type="body-l" color="secondary">${domains}</ui-text>
                      </div>
                      <ui-text type="body-m" color="secondary">${description}</ui-text>
                    </div>
                  </ui-toggle>
                `,
              )}
            </div>
          </section>
        `}
      </settings-page-layout>
    </template>
  `,
};
