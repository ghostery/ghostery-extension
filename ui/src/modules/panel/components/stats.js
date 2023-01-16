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

import { html, msg, router, dispatch } from 'hybrids';

export default {
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
  wtmUrl: ({ domain }) =>
    domain
      ? fetch(`https://www.whotracks.me/websites/${domain}.html`).then(
          (res) => {
            if (res.status !== 200) {
              throw Error('Not found');
            }
            return res.url;
          },
        )
      : Promise.reject(),
  type: {
    value: 'graph',
    observe(host, value, lastValue) {
      if (lastValue && value !== lastValue) {
        dispatch(host, 'typechange');
      }
    },
  },
  dialog: undefined,
  label: msg`Trackers detected`,
  content: ({
    categories,
    categoryList,
    trackers,
    wtmUrl,
    type,
    dialog,
    label,
  }) => html`
    <template layout="column gap:2">
      <div layout="row items:center gap height::4.5">
        <div layout="row gap grow">
          <ui-text type="label-m">${label}</ui-text>
          <ui-tooltip wrap autohide="10">
            <span slot="content" layout="block width:200px">
              Mind that not all listed entities are trackers, that is not all of
              them collect personal data
            </span>
            <ui-icon name="info" color="gray-400" layout="size:2"></ui-icon>
          </ui-tooltip>
        </div>
        ${html.resolve(
          wtmUrl.then(
            (url) => html`
              <ui-tooltip>
                <span slot="content">WhoTracks.Me Statistical Report</span>
                <ui-panel-action>
                  <a href="${url}" target="_blank">
                    <ui-icon name="whotracksme"></ui-icon>
                  </a>
                </ui-panel-action>
              </ui-tooltip>
            `,
          ),
        )}
        ${trackers &&
        html`
          <ui-panel-action-group>
            <ui-tooltip>
              <span slot="content">Simple View</span>
              <ui-panel-action
                grouped
                active="${type === 'graph'}"
                layout="size:30px"
              >
                <button onclick="${html.set('type', 'graph')}">
                  <ui-icon name="chart"></ui-icon>
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
                  <ui-icon name="list"></ui-icon>
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
            ${!categoryList.length &&
            html`
              <ui-text type="body-s" color="gray-600" layout="grow row center">
                No trackers detected
              </ui-text>
            `}
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
        <section layout="column grow">
          ${!categoryList.length &&
          html`
            <ui-panel-list layout="grow">
              <ui-text type="body-s" color="gray-600" layout="grow row center">
                No trackers detected
              </ui-text>
            </ui-panel-list>
          `}
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
};
