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
import TrackerCategory from '../store/tracker-category.js';

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

export function updateException(tracker) {
  return async (host, event) => {
    const { value } = event.target;
    await store.set(tracker.exception, { overwriteStatus: value });
    store.clear([TrackerCategory], false);
  };
}

function clearCategory(id) {
  return async () => {
    const category = store.get(TrackerCategory, id);

    await Promise.all(
      category.trackers
        .filter((t) => t.exception.overwriteStatus)
        .map((tracker) =>
          store.set(tracker.exception, { overwriteStatus: false }),
        ),
    );

    store.clear([TrackerCategory], false);
  };
}

export default {
  [router.connect]: {
    stack: [TrackerDetails],
  },
  options: store(Options),
  categories: ({ query, filter }) =>
    store.get([TrackerCategory], { query, filter }),
  category: '',
  limits: undefined,
  query: '',
  filter: '',
  content: ({
    options,
    categories,
    category,
    limits = {},
    query,
    filter,
  }) => html`
    <template layout="contents">
      <gh-settings-page-layout layout="gap:4">
        ${store.ready(options) &&
        html`
          <section layout="column gap:4" layout@768px="gap:5">
            <div layout="column gap" layout@992px="margin:bottom">
              <ui-text type="headline-l" mobile-type="headline-m">
                Tracker database
              </ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                Listed entities may or may not be trackers, meaning not all of
                them are collecting your personal data.
              </ui-text>
              <ui-text
                type="label-m"
                mobile-type="body-m"
                color="primary-700"
                underline
              >
                <a
                  href="https://github.com/ghostery/trackerdb"
                  rel="noreferrer"
                  layout="row gap:0.5"
                  target="_blank"
                >
                  View trackerdb on GitHub
                  <ui-icon name="arrow-right-s"></ui-icon>
                </a>
              </ui-text>
            </div>
            <div layout="row:wrap gap items:center">
              <gh-settings-button
                layout="width::12 grow"
                layout@768px="grow:0"
                onclick="${html.set(
                  'category',
                  category !== '_all' ? '_all' : '',
                )}"
              >
                ${category !== '_all' ? msg`Expand` : msg`Collapse`}
              </gh-settings-button>
              <gh-settings-input layout="grow" layout@768px="grow:0">
                <select value="${filter}" onchange="${html.set('filter')}">
                  <option selected value="">Show all</option>
                  <option value="blocked">Blocked</option>
                  <option value="trusted">Trusted</option>
                </select>
              </gh-settings-input>
              <gh-settings-input layout="grow:5 width::250px" icon="search">
                <input
                  type="search"
                  defaultValue="${query}"
                  oninput="${setLazyQuery}"
                  placeholder="Search for a tracker or organization..."
                />
              </gh-settings-input>
            </div>
            <div layout="column gap:0.5">
              ${store.ready(categories) &&
              categories.map(
                ({
                  id,
                  key,
                  description,
                  trackers,
                  blocked,
                  trusted,
                  blockedByDefault,
                }) =>
                  html`
                    <gh-settings-trackers-list
                      name="${key}"
                      description="${description}"
                      open="${isActive(category, key)}"
                      blocked="${blocked}"
                      trusted="${trusted}"
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
                                        <ui-text color="gray-600">
                                          ${tracker.organization.name}
                                        </ui-text>
                                      `}
                                    </a>
                                  </ui-action>
                                  ${store.ready(tracker.exception) &&
                                  html`
                                    <div layout="row items:center gap">
                                      ${tracker.exception.overwriteStatus &&
                                      html`
                                        <ui-text
                                          type="label-s"
                                          color="gray-500"
                                        >
                                          adjusted
                                        </ui-text>
                                      `}
                                      <ui-panel-protection-status-toggle
                                        value="${tracker.exception
                                          .overwriteStatus}"
                                        blockByDefault="${blockedByDefault}"
                                        responsive
                                        onchange="${updateException(tracker)}"
                                        layout="shrink:0"
                                      ></ui-panel-protection-status-toggle>
                                    </div>
                                  `}
                                </div>
                              `.key(tracker.id),
                          )}
                        </div>
                        ${(limits[key] || PATTERNS_LIMIT) < trackers.length &&
                        html`
                          <div layout="row center margin:bottom:2">
                            <gh-settings-button onclick="${loadMore(key)}">
                              Load more
                            </gh-settings-button>
                          </div>
                        `}
                      `}
                    </gh-settings-trackers-list>
                  `.key(key),
              )}
            </div>
          </section>
        `}
      </gh-settings-page-layout>
    </template>
  `,
};
