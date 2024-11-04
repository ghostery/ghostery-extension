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
import { GHOSTERY_DOMAIN } from '/utils/urls.js';

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
  readonly: false,
  domain: '',
  wtmLink: false,
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
    readonly,
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
        html`
          <ui-tooltip position="bottom">
            <span slot="content">WhoTracks.Me Statistical Report</span>
            <ui-action-button layout="size:4.5">
              <a
                href="${WTM_URL}websites/${domain}"
                onclick="${openTabWithUrl}"
                target="_blank"
              >
                <ui-icon name="whotracksme" color="gray-800"></ui-icon>
              </a>
            </ui-action-button>
          </ui-tooltip>
        `}
        ${trackers &&
        html`
          <ui-action-button-group>
            <ui-tooltip position="bottom">
              <span slot="content">Simple View</span>
              <ui-action-button
                grouped
                active="${type === 'graph'}"
                layout="size:30px"
              >
                <button onclick="${html.set('type', 'graph')}">
                  <ui-icon name="chart" color="gray-800"></ui-icon>
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
                  <ui-icon name="list" color="gray-800"></ui-icon>
                </button>
              </ui-action-button>
            </ui-tooltip>
          </ui-action-button-group>
        `}
      </div>
      <ui-switch>
        <ui-switch-item
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
                <ui-category
                  name="${category}"
                  count="${count}"
                  onclick="${trackers && html.set('type', 'list')}"
                  actionable="${!!trackers}"
                ></ui-category>
              `,
            )}
          </div>
        </ui-switch-item>
        ${trackers &&
        html`
          <ui-switch-item
            active="${type === 'list'}"
            layout="column grow height::104px"
          >
            ${!trackers.length &&
            html`
              <ui-list layout="grow margin:0.5:0">
                <ui-text
                  type="body-s"
                  color="gray-600"
                  layout="grow row center"
                >
                  No activities detected
                </ui-text>
              </ui-list>
            `}
            ${trackers.map(
              ([name, trackers]) => html`
                <ui-list
                  name="${name}"
                  layout:last-of-type="margin:bottom:0.5"
                  layout:first-of-type="margin:top:0.5"
                >
                  <div slot="header" layout="row items:center gap">
                    <ui-text type="label-s">${trackers.length}</ui-text>
                  </div>

                  <section id="content" layout="column gap:0.5">
                    ${trackers.map(
                      (tracker) => html`
                        <div
                          layout="row gap content:space-between items:center"
                        >
                          <ui-text type="body-s">
                            <a
                              href="${router.url(dialog, {
                                trackerId: tracker.id,
                              })}"
                              layout="row items:center gap:0.5 padding:0.5:0"
                              data-qa="button:tracker:${tracker.id}"
                            >
                              <ui-tooltip>
                                <span slot="content">
                                  View activity details
                                </span>
                                <ui-tracker-name>
                                  ${tracker.name}
                                </ui-tracker-name>
                              </ui-tooltip>
                              <ui-badge> ${tracker.requestsCount} </ui-badge>
                              ${tracker.blocked &&
                              html`<ui-icon
                                name="block-s"
                                color="danger-700"
                                data-qa="icon:tracker:${tracker.id}:blocked"
                              ></ui-icon>`}
                              ${tracker.modified &&
                              html`<ui-icon
                                name="eye"
                                color="primary-700"
                                data-qa="icon:tracker:${tracker.id}:modified"
                              ></ui-icon>`}
                            </a>
                          </ui-text>
                          ${!readonly &&
                          html`
                            <ui-action-button layout="shrink:0 width:4.5">
                              <a
                                href="${router.url(exceptionDialog, {
                                  trackerId: tracker.id,
                                })}"
                                layout="row center relative"
                              >
                                <ui-protection-status-icon
                                  blockByDefault="${tracker.blockedByDefault}"
                                  status="${store.ready(tracker.exception)
                                    ? tracker.exception.getDomainStatus(domain)
                                    : {
                                        type: tracker.blockedByDefault
                                          ? 'block'
                                          : 'trust',
                                      }}"
                                ></ui-protection-status-icon>
                              </a>
                            </ui-action-button>
                          `}
                        </div>
                      `,
                    )}
                  </section>
                </ui-list>
              `,
            )}
          </ui-switch-item>
        `}
      </ui-switch>
    </template>
  `,
};
