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

import { define, html, router } from 'hybrids';

export default define({
  tag: 'ui-panel-stats',
  categories: undefined,
  categoryList: ({ categories = [] }) =>
    Object.entries(
      categories.reduce(
        (all, current) => ({
          ...all,
          [current]: (all[current] || 0) + 1,
        }),
        {},
      ),
    ),
  trackers: undefined,
  domain: '',
  type: 'graph',
  dialog: undefined,
  render: ({
    categories,
    categoryList,
    trackers,
    domain,
    type,
    dialog,
  }) => html`
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
        ${trackers &&
        html`<div class="action-group">
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
        </div>`}
      </div>
      ${type === 'graph' &&
      html`
        <div layout="row gap:3 height::16">
          <ui-tracker-wheel
            categories="${categories}"
            layout="shrink:0 size:12 margin:top"
          ></ui-tracker-wheel>
          <div layout="column grow">
            ${categoryList.map(
              ([category, count]) => html`
                <ui-panel-category
                  name="${category}"
                  count="${count}"
                ></ui-panel-category>
              `,
            )}
          </div>
        </div>
      `}
      ${type === 'list' &&
      html`
        <section>
          ${trackers.map(
            ([name, { count, trackers }]) => html`
              <ui-panel-list name="${name}">
                <div slot="header" layout="row items:center gap">
                  <ui-panel-badge>${count}</ui-panel-badge>
                </div>

                <section id="content" layout="column items:start">
                  ${trackers.map(
                    (t) =>
                      html`
                        <ui-text type="body-s" ellipsis>
                          <a
                            href="${t.company && dialog
                              ? router.url(dialog, { company: t.company })
                              : ''}"
                          >
                            <div
                              layout="row items:center gap:0.5 padding:0.5:0"
                            >
                              ${t.name}
                              <ui-panel-badge>${t.count}</ui-panel-badge>
                            </div>
                          </a>
                        </ui-text>
                      `,
                  )}
                </section>
              </ui-panel-list>
            `,
          )}
        </section>
      `}
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
