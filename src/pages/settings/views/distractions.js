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
    id: 'signInWithGoogle',
    title: msg`Sign in with Google`,
    description: msg`Hide Google sign in prompts across the web.`,
    websites: [msg`websites with Google sign in`],
  },
  {
    id: 'socialWidgets',
    title: msg`Social media clutter`,
    description: msg`Hide social widgets and sharing panels that add noise to pages.`,
    websites: ['facebook.com', 'twitter.com', 'linkedin.com', 'pinterest.com'],
  },
  {
    id: 'shorts',
    title: msg`Short video feeds`,
    description: msg`Hide endless short video feeds that can pull you into distraction loops.`,
    websites: ['youtube.com', 'instagram.com', 'facebook.com'],
  },
  {
    id: 'browserPrompts',
    title: msg`Browser promotions`,
    description: msg`Hide browser prompts that interrupt your browsing.`,
    websites: ['google.com', 'bing.com', 'microsoft.com'],
  },
];

function filterDistractions(query, filter, options) {
  const q = query.trim().toLowerCase();

  return DISTRACTIONS.filter((distraction) => {
    if (filter === 'enabled' && !options.distractions[distraction.id]) return false;
    if (filter === 'disabled' && options.distractions[distraction.id]) return false;

    if (!q) return true;

    const { title, websites, description } = distraction;
    return (
      title.toLowerCase().includes(q) ||
      websites.some((w) => w.includes(q)) ||
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
        ${
          store.ready(options) &&
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
                    placeholder="${msg`Search distractions or websites...`}"
                    oninput="${html.set('query')}"
                  />
                </ui-input>
              </div>

              <div layout="column gap:5">
                ${distractions.map(
                  ({ id, title, websites, description }) => html`
                    <ui-toggle
                      value="${options.distractions[id]}"
                      onchange="${html.set(options, `distractions.${id}`)}"
                      data-qa="toggle:distractions:${id}"
                    >
                      <div layout="column gap:0.5">
                        <div layout="column gap:0.5">
                          <ui-text type="label-l">${title}</ui-text>
                          <ui-text type="body-m" color="secondary">${description}</ui-text>
                          ${
                            websites &&
                            html`
                              <ui-text type="body-s" color="tertiary">
                                Applies to: ${websites.join(', ')}
                              </ui-text>
                            `
                          }
                        </div>
                      </div>
                    </ui-toggle>
                  `,
                )}
              </div>
            </section>
          `
        }
      </settings-page-layout>
    </template>
  `,
};
