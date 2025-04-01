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
import TrackerCategory from '/store/tracker-category.js';

import * as exceptions from '/utils/exceptions.js';

import TrackerDetails from './tracker-details.js';

const PATTERNS_LIMIT = 50;

function loadMore(category) {
  return (host) => {
    host.limits = {
      ...(host.limits || {}),
      [category]: (host.limits?.[category] || PATTERNS_LIMIT) + PATTERNS_LIMIT,
    };
  };
}

let timeout;
function setLazyQuery(host, event) {
  const value = event.target.value || '';

  clearTimeout(timeout);
  if (value.length >= 2) {
    timeout = setTimeout(() => {
      host.query = value;
      host.category = '_all';
    }, 50);
  } else {
    host.category = '';
    host.query = '';
  }
}

function isActive(category, key) {
  return category === key || category === '_all';
}

function isTrusted(options, tracker) {
  const status = exceptions.getStatus(options, tracker.id);
  return status.trusted && status.global;
}

export function toggleException(tracker) {
  return async ({ options }) => exceptions.toggleGlobal(options, tracker.id);
}

function clearCategory(id) {
  return async ({ options }) => {
    const category = store.get(TrackerCategory, id);

    const exceptions = category.trackers
      .filter((t) => options.exceptions[t.id]?.global)
      .reduce((acc, t) => {
        acc[t.id] = null;
        return acc;
      }, {});

    await store.set(options, { exceptions });
  };
}

export default {
  [router.connect]: {
    stack: () => [TrackerDetails],
  },
  options: store(Options),
  categories: ({ query, filter }) =>
    store.get([TrackerCategory], { query, filter }),
  category: '',
  limits: undefined,
  query: '',
  filter: '',
  render: ({
    options,
    categories,
    category,
    limits = {},
    query,
    filter,
  }) => html`
    <template layout="contents">
      <settings-page-layout layout="gap:4">
        ${store.ready(options) &&
        html`
          <section layout="column gap:4" layout@768px="gap:5">
            <div layout="column gap" layout@992px="margin:bottom">
              <ui-text type="headline-m"> Tracker Database </ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="secondary">
                Mind that not all listed activities are trackers, that is not
                all of them collect personal data.
              </ui-text>
              <ui-text
                type="label-m"
                mobile-type="body-m"
                color="brand-primary"
                underline
              >
                <a
                  href="https://github.com/ghostery/trackerdb"
                  rel="noreferrer"
                  layout="block"
                  target="_blank"
                >
                  Contribute to Ghostery Tracker Database on Github
                  <ui-icon
                    name="arrow-right-s"
                    layout="block inline margin:bottom:-2px"
                  ></ui-icon>
                </a>
              </ui-text>
            </div>
            <div layout="row:wrap gap items:center">
              <ui-button
                layout="width::12 grow"
                layout@768px="grow:0"
                onclick="${html.set(
                  'category',
                  category !== '_all' ? '_all' : '',
                )}"
              >
                <button>
                  ${category !== '_all' ? msg`Expand` : msg`Collapse`}
                </button>
              </ui-button>
              <ui-input layout="grow" layout@768px="grow:0">
                <select value="${filter}" onchange="${html.set('filter')}">
                  <option selected value="">Show all</option>
                  <option value="adjusted">
                    <!-- Plural form - list of adjusted trackers | tracker-list -->Adjusted
                  </option>
                  <option value="blocked">
                    <!-- Plural form - list of blocked trackers | tracker-list -->Blocked
                  </option>
                  <option value="trusted">
                    <!-- Plural form - list of trusted trackers | tracker-list -->Trusted
                  </option>
                </select>
              </ui-input>
              <ui-input layout="grow:5 width::250px" icon="search">
                <input
                  type="search"
                  defaultValue="${query}"
                  oninput="${setLazyQuery}"
                  placeholder="${msg`Search for a tracker or organization...`}"
                />
              </ui-input>
            </div>
            <div layout="column gap:0.5">
              ${store.ready(categories) &&
              categories.map(
                ({
                  id,
                  key,
                  description,
                  trackers,
                  adjusted,
                  blockedByDefault,
                }) =>
                  html`
                    <settings-trackers-list
                      name="${key}"
                      description="${description}"
                      open="${isActive(category, key)}"
                      size="${trackers.length}"
                      adjusted="${adjusted}"
                      blockedByDefault="${blockedByDefault}"
                      ontoggle="${html.set(
                        'category',
                        isActive(category, key) ? '' : key,
                      )}"
                      onclear="${clearCategory(id)}"
                    >
                      ${isActive(category, key) &&
                      html`
                        <ui-line></ui-line>
                        <div
                          layout="column gap"
                          layout@768px="padding:left:102px"
                        >
                          ${trackers.map(
                            (tracker, index) =>
                              index <= (limits[key] || PATTERNS_LIMIT) &&
                              html`
                                <div layout="row items:center gap">
                                  <ui-action>
                                    <a
                                      href="${router.url(TrackerDetails, {
                                        tracker: tracker.id,
                                      })}"
                                      layout="column grow basis:0"
                                      layout@768px="row gap:2"
                                    >
                                      <ui-text type="label-m">
                                        ${tracker.name}
                                      </ui-text>
                                      ${tracker.organization &&
                                      html`
                                        <ui-text color="secondary">
                                          ${tracker.organization.name}
                                        </ui-text>
                                      `}
                                    </a>
                                  </ui-action>
                                  <div layout="row items:center gap">
                                    ${options.exceptions[tracker.id] &&
                                    html`
                                      <ui-text type="label-s" color="secondary">
                                        <!-- Singular form - tracker has been adjusted | tracker -->adjusted
                                      </ui-text>
                                    `}
                                    <settings-exception-toggle
                                      value="${isTrusted(options, tracker)}"
                                      responsive
                                      onchange="${toggleException(tracker)}"
                                      layout="shrink:0"
                                    ></settings-exception-toggle>
                                  </div>
                                </div>
                              `.key(tracker.id),
                          )}
                        </div>
                        ${(limits[key] || PATTERNS_LIMIT) < trackers.length &&
                        html`
                          <div layout="row center margin:bottom:2">
                            <ui-button onclick="${loadMore(key)}">
                              <button>Load more</button>
                            </ui-button>
                          </div>
                        `}
                      `}
                    </settings-trackers-list>
                  `.key(key),
              )}
            </div>
          </section>
        `}
      </settings-page-layout>
    </template>
  `,
};
