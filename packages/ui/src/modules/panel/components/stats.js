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

import { html, store, router, dispatch } from 'hybrids';
import { getStats } from '@ghostery/trackers-preview/page_scripts';
import { GHOSTERY_DOMAIN } from '@ghostery/libs';

const WTM_URL = `https://www.${GHOSTERY_DOMAIN}/whotracksme/`;

function openTabWithUrl(host, event) {
  if (chrome.tabs?.create) {
    event.preventDefault();
    Promise.resolve(chrome.tabs.create({ url: event.currentTarget.href })).then(
      () => {
        window.close();
      },
    );
  }
}

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
  trackers: (host, trackers) =>
    trackers &&
    Object.entries(
      trackers.reduce(
        (categories, tracker) => ({
          ...categories,
          [tracker.category]: [
            ...(categories[tracker.category] || []),
            tracker,
          ],
        }),
        {},
      ),
    ),
  paused: false,
  domain: '',
  wtmLink: ({ domain }) =>
    domain && getStats(domain).then(({ stats }) => !!stats.length),
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
  render: ({
    categories,
    categoryList,
    trackers,
    paused,
    domain,
    wtmLink,
    type,
    dialog,
    exceptionDialog,
  }) => html`
    <template layout="column gap:0.5">
      <div layout="row items:center gap height::4.5">
        <div layout="row items:center gap grow">
          <ui-text type="label-m">Observed activities</ui-text>
          <slot name="header"></slot>
        </div>
        ${wtmLink &&
        html.resolve(
          wtmLink.then(
            (link) =>
              link &&
              html`
                <ui-tooltip position="bottom">
                  <span slot="content">WhoTracks.Me Statistical Report</span>
                  <ui-panel-action layout="size:4.5">
                    <a
                      href="${WTM_URL}websites/${domain}"
                      onclick="${openTabWithUrl}"
                      target="_blank"
                    >
                      <ui-icon name="whotracksme" color="gray-900"></ui-icon>
                    </a>
                  </ui-panel-action>
                </ui-tooltip>
              `,
          ),
        )}
        ${trackers &&
        html`
          <ui-panel-action-group>
            <ui-tooltip position="bottom">
              <span slot="content">Simple View</span>
              <ui-panel-action
                grouped
                active="${type === 'graph'}"
                layout="size:30px"
              >
                <button onclick="${html.set('type', 'graph')}">
                  <ui-icon name="chart" color="gray-900"></ui-icon>
                </button>
              </ui-panel-action>
            </ui-tooltip>
            <ui-tooltip position="bottom">
              <span slot="content">Detailed View</span>
              <ui-panel-action
                grouped
                active="${type === 'list'}"
                layout="size:30px"
              >
                <button onclick="${html.set('type', 'list')}">
                  <ui-icon name="list" color="gray-900"></ui-icon>
                </button>
              </ui-panel-action>
            </ui-tooltip>
          </ui-panel-action-group>
        `}
      </div>
      <ui-panel-switch>
        <ui-panel-switch-item
          active="${type === 'graph'}"
          layout="row gap:3 padding:0:1"
        >
          <ui-tracker-wheel
            categories="${categories}"
            layout="shrink:0 size:12 margin:top"
          ></ui-tracker-wheel>
          <div layout="column grow">
            ${!categoryList.length &&
            html`
              <ui-text type="body-s" color="gray-600" layout="grow row center">
                No activities detected
              </ui-text>
            `}
            ${categoryList.map(
              ([category, count]) => html`
                <ui-panel-category
                  name="${category}"
                  count="${count}"
                  onclick="${trackers && html.set('type', 'list')}"
                  actionable="${!!trackers}"
                ></ui-panel-category>
              `,
            )}
          </div>
        </ui-panel-switch-item>
        ${trackers &&
        html`
          <ui-panel-switch-item
            active="${type === 'list'}"
            layout="column grow height::104px"
          >
            ${!trackers.length &&
            html`
              <ui-panel-list layout="grow margin:0.5:0">
                <ui-text
                  type="body-s"
                  color="gray-600"
                  layout="grow row center"
                >
                  No activities detected
                </ui-text>
              </ui-panel-list>
            `}
            ${trackers.map(
              ([name, trackers]) => html`
                <ui-panel-list
                  name="${name}"
                  layout:last-of-type="margin:bottom:0.5"
                  layout:first-of-type="margin:top:0.5"
                >
                  <div slot="header" layout="row items:center gap">
                    <ui-panel-badge>${trackers.length}</ui-panel-badge>
                  </div>

                  <section id="content" layout="column gap:0.5">
                    ${trackers.map(
                      (tracker) =>
                        html`
                          <div
                            layout="row gap content:space-between items:center"
                          >
                            <ui-text type="body-s">
                              <a
                                href="${router.url(dialog, {
                                  trackerId: tracker.id,
                                })}"
                                layout="row items:center gap:0.5 padding:0.5:0"
                              >
                                <ui-tooltip>
                                  <span slot="content">
                                    View activity details
                                  </span>
                                  <ui-panel-tracker-name>
                                    ${tracker.name}
                                  </ui-panel-tracker-name>
                                </ui-tooltip>
                                <ui-panel-badge>
                                  ${tracker.requestsCount}
                                </ui-panel-badge>
                                ${tracker.blocked &&
                                html`<ui-icon
                                  name="block-s"
                                  color="gray-400"
                                ></ui-icon>`}
                                ${tracker.modified &&
                                html`<ui-icon
                                  name="eye"
                                  color="gray-400"
                                ></ui-icon>`}
                              </a>
                            </ui-text>
                            ${!paused &&
                            html`
                              <ui-tooltip>
                                <span slot="content">
                                  Set blocking preference
                                </span>
                                <ui-panel-action
                                  type="outline"
                                  layout="shrink:0 width:4.5"
                                >
                                  <a
                                    href="${router.url(exceptionDialog, {
                                      trackerId: tracker.id,
                                    })}"
                                    layout="row center relative"
                                  >
                                    <ui-panel-protection-status-icon
                                      status="${store.ready(tracker.exception)
                                        ? tracker.exception.getDomainStatus(
                                            domain,
                                          )
                                        : {
                                            type: tracker.blockedByDefault
                                              ? 'block'
                                              : 'trust',
                                          }}"
                                    ></ui-panel-protection-status-icon>
                                  </a>
                                </ui-panel-action>
                              </ui-tooltip>
                            `}
                          </div>
                        `,
                    )}
                  </section>
                </ui-panel-list>
              `,
            )}
          </ui-panel-switch-item>
        `}
      </ui-panel-switch>
    </template>
  `,
};
