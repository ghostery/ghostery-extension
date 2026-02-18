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

import { html, dispatch } from 'hybrids';

export default {
  categories: undefined,
  groupedCategories: ({ categories = [] }) =>
    Object.entries(
      categories.reduce(
        (all, current) => ({
          ...all,
          [current]: (all[current] || 0) + 1,
        }),
        {},
      ),
    ),
  readonly: false,
  domain: '',
  type: {
    value: 'graph',
    observe(host, value, lastValue) {
      if (lastValue && value !== lastValue) {
        dispatch(host, 'typechange');
      }
    },
  },
  dialog: undefined,
  exceptionDialog: undefined,
  render: ({ categories, groupedCategories, type }) => html`
    <template layout="column gap:0.5">
      <div layout="row items:center gap height::4.5">
        <div layout="row items:center gap grow">
          <ui-text type="label-m">Observed activities</ui-text>
          <slot name="header"></slot>
        </div>
        <slot name="actions"></slot>
        ${type &&
        html`
          <ui-action-button-group>
            <ui-tooltip position="bottom">
              <span slot="content">Simple View</span>
              <ui-action-button grouped active="${type === 'graph'}" layout="size:30px">
                <button onclick="${html.set('type', 'graph')}">
                  <ui-icon name="chart" color="primary"></ui-icon>
                </button>
              </ui-action-button>
            </ui-tooltip>
            <ui-tooltip position="bottom">
              <span slot="content">Detailed View</span>
              <ui-action-button
                grouped
                active="${type === 'list'}"
                layout="size:30px"
                data-qa="button:detailed-view"
              >
                <button onclick="${html.set('type', 'list')}">
                  <ui-icon name="list" color="primary"></ui-icon>
                </button>
              </ui-action-button>
            </ui-tooltip>
          </ui-action-button-group>
        `}
      </div>
      <ui-switch>
        <ui-switch-item active="${!type || type === 'graph'}" layout="row gap:3 padding:0:1">
          <ui-tracker-wheel
            categories="${categories}"
            layout="shrink:0 size:12 margin:top"
          ></ui-tracker-wheel>
          <div layout="column grow">
            ${!groupedCategories.length &&
            html`
              <ui-text type="body-s" color="secondary" layout="grow row center">
                No activities detected
              </ui-text>
            `}
            ${groupedCategories.map(
              ([category, count]) => html`
                <ui-category
                  name="${category}"
                  count="${count}"
                  onclick="${type && html.set('type', 'list')}"
                  actionable="${!!type}"
                ></ui-category>
              `,
            )}
          </div>
        </ui-switch-item>
        ${type &&
        html`
          <ui-switch-item active="${type === 'list'}" layout="column grow height::104px">
            <slot name="list"></slot>
          </ui-switch-item>
        `}
      </ui-switch>
    </template>
  `,
};
