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

import { define, html } from 'hybrids';
import { getCategoryColor } from '../utils/categories.js';
import * as labels from '../utils/labels.js';

export default define({
  tag: 'ui-stats',
  categories: undefined,
  list: ({ categories = [] }) =>
    Object.entries(
      categories.reduce(
        (all, current) => ({
          ...all,
          [current]: (all[current] || 0) + 1,
        }),
        {},
      ),
    ),
  domain: '',
  type: 'graph',
  render: ({ categories, list, domain, type }) => html`
    <template layout="column gap:2">
      <div layout="row items:center gap">
        <div layout="grow"><slot></slot></div>
        <ui-tooltip>
          <span slot="content">WhoTracks.Me Statistical Report</span>
          <a
            class="action"
            href="https://www.whotracks.me/websites/${domain}.html"
            target="_blank"
          >
            <ui-icon name="panel-whotracksme"></ui-icon>
          </a>
        </ui-tooltip>
        <div class="action-group">
          <ui-tooltip>
            <span slot="content">Graph View</span>
            <button
              class="action ${type === 'graph' ? 'active' : ''}"
              onclick="${html.set('type', 'graph')}"
            >
              <ui-icon name="panel-chart"></ui-icon>
            </button>
          </ui-tooltip>
          <ui-tooltip>
            <span slot="content">Detailed View</span>
            <button
              class="action ${type === 'list' ? 'active' : ''}"
              onclick="${html.set('type', 'list')}"
            >
              <ui-icon name="panel-list"></ui-icon>
            </button>
          </ui-tooltip>
        </div>
      </div>
      <div layout="row gap:3">
        <ui-tracker-wheel
          categories="${categories}"
          layout="shrink:0 size:12 margin:top"
        ></ui-tracker-wheel>
        <div layout="column grow">
          ${list.map(
            ([category, count]) => html`
              <ui-stats-category
                name="${category}"
                count="${count}"
              ></ui-stats-category>
            `,
          )}
        </div>
      </div>
    </template>
  `.css`
    .action {
      cursor: pointer;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      appearance: none;
      border: none;
      background: var(--ui-color-white);
      border: 1px solid var(--ui-color-gray-200);
      box-shadow: 0px 2px 6px rgba(32, 44, 68, 0.08);
      border-radius: 8px;
      width: 36px;
      height: 36px;
      transition: all 0.2s;
      padding: 0;
    }

    .action { color: var(--ui-color-gray-900); }
    .action:hover { color: var(--ui-color-primary-500); }
    .action:active { color: var(--ui-color-primary-700); }

    .action-group {
      display: flex;
      background: var(--ui-color-gray-100);
      border: 1px solid  var(--ui-color-gray-200);
      border-radius: 8px;
      padding: 2px;
      gap: 2px;
    }

    .action-group .action {
      width: 30px;
      height: 30px;
    }

    .action-group .action:not(.active) {
      background: none;
      border: none;
      box-shadow: none;
    }
  `,
});

define({
  tag: 'ui-stats-category',
  name: '',
  color: ({ name }) => getCategoryColor(name),
  count: 0,
  full: false,
  render: ({ name, color, count }) => html`
    <template layout="row gap items:center">
      <div id="pill" layout="size:12px:6px"></div>
      <div id="label" layout="row gap items:center grow">
        <ui-text type="body-s" color="gray-500" layout="grow">
          ${labels.categories[name]}
        </ui-text>
        <ui-text type="label-s" id="count">${count}</ui-text>
      </div>
    </template>
  `.css`
    #pill {
      background: ${color};
      border-radius: 3px;
    }

    #count {
      font-weight: 600;
    }

    :host([full]) #pill {
      display: none;
    }

    :host(:not([full])) #label {
      border-bottom: 1px solid var(--ui-color-gray-200);
      padding: 4px 0;
    }

    :host(:last-child:not([full])) #label {
      border-bottom: none;
    }
  `,
});
