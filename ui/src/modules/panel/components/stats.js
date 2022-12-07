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

import { define, html, msg, router } from 'hybrids';

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
  label: msg`Trackers found`,
  content: ({
    categories,
    categoryList,
    trackers,
    domain,
    type,
    dialog,
    label,
  }) => html`
    <template layout="column gap:2">
      <div layout="row items:center gap">
        <div layout="grow">
          <ui-text type="label-m">${label}</ui-text>
        </div>
        <ui-tooltip>
          <span slot="content">WhoTracks.Me Statistical Report</span>
          <ui-panel-action>
            <a
              href="https://www.whotracks.me/websites/${domain}.html"
              target="_blank"
            >
              <ui-icon name="panel-whotracksme"></ui-icon>
            </a>
          </ui-panel-action>
        </ui-tooltip>
        ${trackers &&
        html`
          <ui-panel-action-group>
            <ui-tooltip>
              <span slot="content">Graph View</span>
              <ui-panel-action
                grouped
                active="${type === 'graph'}"
                layout="size:30px"
              >
                <button onclick="${html.set('type', 'graph')}">
                  <ui-icon name="panel-chart"></ui-icon>
                </button>
              </ui-panel-action>
            </ui-tooltip>
            <ui-tooltip>
              <span slot="content">Detailed View</span>
              <ui-panel-action
                grouped
                active="${type === 'list'}"
                layout="size:30px"
              >
                <button onclick="${html.set('type', 'list')}">
                  <ui-icon name="panel-list"></ui-icon>
                </button>
              </ui-panel-action>
            </ui-tooltip>
          </ui-panel-action-group>
        `}
      </div>
      ${type === 'graph' &&
      html`
        <div layout="row gap:3">
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
                        <ui-text type="body-s">
                          ${t.company && dialog
                            ? html`
                                <a
                                  href="${router.url(dialog, {
                                    company: t.company,
                                  })}"
                                  layout="row items:center gap:0.5 padding:0.5:0"
                                >
                                  ${t.name}
                                  <ui-panel-badge>${t.count}</ui-panel-badge>
                                </a>
                              `
                            : html`<a
                                layout="row items:center gap:0.5 padding:0.5:0"
                              >
                                ${t.name}
                                <ui-panel-badge>${t.count}</ui-panel-badge>
                              </a>`}
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
  `,
});
