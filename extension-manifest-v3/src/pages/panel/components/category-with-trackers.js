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

import { html, define, store } from '/hybrids.js';
import { t, getCategoryName } from '/vendor/@whotracksme/ui/src/i18n.js';
import {
  chavronDown,
  externalLink,
} from '/vendor/@whotracksme/ui/src/components/icons.js';
import Stats from '../store/stats.js';

function toggleShowMore(host) {
  host.shouldShowMore = !host.shouldShowMore;
}

define({
  tag: 'gh-panel-category-with-trackers',
  category: '',
  stats: store(Stats),
  shouldShowMore: false,
  trackerCounts: ({ stats, category }) => {
    const { trackers } = stats.byCategory[category];
    const _trackerCounts = trackers.reduce(
      (all, current) => ({
        ...all,
        [current.id]: (all[current.id] || 0) + 1,
      }),
      {},
    );
    return Object.keys(_trackerCounts)
      .sort()
      .map((tracker) => [tracker, _trackerCounts[tracker]]);
  },
  render: ({ category, stats, shouldShowMore, trackerCounts }) => html`
    <main onclick="${toggleShowMore}">
      <category-bullet category=${category} size=${12}></category-bullet>
      <label>${getCategoryName(category)}</label>
      <strong class="count"
        >${stats.byCategory[category].count} ${t('trackers_detected')}</strong
      >
      <button class="${{ more: shouldShowMore }}">${chavronDown}</button>
    </main>
    ${shouldShowMore &&
    html`
      <ul>
        ${trackerCounts.map(
          ([tracker, count]) => html`
            <li>
              <label>${stats.byTracker[tracker].name}</label>
              <strong>${count}</strong>
              <a
                href="https://whotracks.me/trackers/${tracker}.html"
                target="_blank"
              >
                ${t('tracker_details')} ${externalLink}
              </a>
            </li>
          `,
        )}
      </ul>
    `}
  `.css`
    :host {
      background-color: white;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
      padding: 10px;
      box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.05);
    }
    main {
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer;
    }
    main button {
      justify-self: flex-end;
      align-self: flex-end;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      right: -5px;
      padding: 5px;
    }
    main button svg {
      height: 18px;
    }
    main label {
      cursor: pointer;
    }
    label {
      margin: 0 7px;
      font-size: 14px;
      line-height: 20px;
      color: var(--black);
    }
    strong {
      text-transform: uppercase;
      color: var(--deep-blue);
      font-size: 11.5px;
      font-weight: 500;
    }
    .count {
      flex: 1;
      text-align: right;
    }
    ul {
      margin: 0;
      padding: 0;
      list-style-type: none;
      list-style: none none inside;
    }
    li {
      padding-left: 20px;
      margin: 10px 0px;
      display: flex;
      flex-direction: row;
    }
    li label {
      margin: 0 5px;
      font-size: 13px;
      line-height: 16px;
    }
    li strong {
      color: var(--deep-blue);
      font-size: 13px;
      font-weight: 500;
      line-height: 16px;
    }
    li a, li a:visited {
      color: var(--text);
      text-align: right;
      flex: 1;
      text-decoration: none;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
    }
    li a svg {
      height: 10px;
    }
    button svg {
      color: var(--deep-blue);
    }
    button.more svg {
      transform: rotate(180deg);
    }
  `,
});
