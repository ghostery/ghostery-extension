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

import { html, msg, router, store } from 'hybrids';
import * as labels from '/ui/labels.js';

import Options, { isPaused } from '/store/options.js';
import TabStats from '/store/tab-stats.js';

import { openTabWithUrl } from '/utils/tabs.js';

import ProtectionStatus from './protection-status.js';

function cleanUp(text) {
  return text.replace(/(\\"|\\n|\\t|\\r)/g, '').trim();
}

function showCopyNotification(host) {
  const wrapper = document.createDocumentFragment();

  Array.from(
    host.querySelectorAll('#panel-company-alerts panel-alert'),
  ).forEach((el) => el.parentNode.removeChild(el));

  html`
    <panel-alert type="success" slide autoclose="2">
      Copied to clipboard
    </panel-alert>
  `(wrapper);

  host.querySelector('#panel-company-alerts').appendChild(wrapper);
}

export default {
  [router.connect]: { dialog: true },
  stats: store(TabStats),
  options: store(Options),
  trackerId: '',
  tracker: ({ stats, trackerId }) =>
    stats.trackers.find((t) => t.id === trackerId),
  status: ({ stats, tracker }) =>
    store.ready(tracker.exception)
      ? tracker.exception.getDomainStatus(stats.hostname)
      : { type: tracker.blockedByDefault ? 'block' : 'trust' },
  wtmUrl: ({ tracker }) =>
    tracker.category !== 'unidentified' &&
    `https://www.ghostery.com/whotracksme/trackers/${tracker.id}`,
  paused: ({ options, stats }) =>
    store.ready(options, stats) && isPaused(options, stats.hostname),
  render: ({ tracker, status, wtmUrl, paused, options }) => html`
    <template layout="column">
      <panel-dialog>
        <div
          id="panel-company-alerts"
          layout="absolute inset:1 bottom:auto"
        ></div>
        <ui-text slot="header" type="label-l">${tracker.name}</ui-text>

        <div
          slot="header"
          layout="center row items:center gap overflow margin:0.5:0:0:0"
        >
          <ui-category-icon
            name="${tracker.category}"
            layout="size:2.5"
          ></ui-category-icon>
          <ui-text slot="header" type="body-s" color="gray-600">
            ${tracker.company &&
            tracker.company !== tracker.name &&
            tracker.company + ' •'}
            ${labels.categories[tracker.category]}
          </ui-text>
        </div>
        ${options.terms &&
        html`
          <div layout="grid:1|max gap">
            ${paused
              ? html`
                  <ui-action-button layout="width:full" disabled>
                    <div layout="row gap">
                      <ui-icon name="pause"></ui-icon>
                      <ui-text type="label-m">Ghostery paused</ui-text>
                    </div>
                  </ui-action-button>
                `
              : html`<ui-action-button layout="width:full height:auto:4.5">
                  <a
                    href="${router.url(ProtectionStatus, {
                      trackerId: tracker.id,
                    })}"
                    layout="row gap padding:0:1.5"
                  >
                    <ui-icon
                      name="${status.type}-m"
                      color="gray-600"
                      layout="size:2.5"
                    ></ui-icon>
                    <ui-text
                      type="label-m"
                      layout="block:center row gap center padding:2px:0"
                    >
                      ${status.website
                        ? (status.type === 'trust' &&
                            msg`Trusted on this website`) ||
                          (status.type === 'block' &&
                            msg`Blocked on this website`)
                        : (status.type === 'trust' &&
                            msg`Trusted on all websites`) ||
                          (status.type === 'block' &&
                            msg`Blocked on all websites`)}
                    </ui-text>
                  </a>
                </ui-action-button>`}
            ${tracker.category !== 'unidentified' &&
            html`
              <ui-action-button layout="width:4.5 height:auto:4.5">
                <a
                  href="${chrome.runtime.getURL(
                    `/pages/settings/index.html#@settings-tracker-details?tracker=${tracker.id}`,
                  )}"
                  onclick="${openTabWithUrl}"
                >
                  <ui-icon name="settings-m"></ui-icon>
                </a>
              </ui-action-button>
            `}
          </div>
        `}
        ${(tracker.organization?.description || wtmUrl) &&
        html`
          <div layout="column gap:0.5">
            ${tracker.organization?.description &&
            html`
              <ui-text type="body-s">
                ${cleanUp(tracker.organization?.description)}
              </ui-text>
            `}
            ${wtmUrl &&
            html`
              <ui-text type="label-xs" color="primary-700" underline>
                <a href="${wtmUrl}" onclick="${openTabWithUrl}">
                  Read more on WhoTracks.Me
                </a>
              </ui-text>
            `}
          </div>
          <ui-line></ui-line>
        `}
        <section
          layout="
            grid:max|1 items:start:stretch content:start gap:1:2.5
            grow:1
          "
        >
          ${tracker.requestsBlocked.length > 0 &&
          html`
            <ui-icon name="block-s" color="danger-700"></ui-icon>
            <div layout="column gap">
              <ui-text type="label-s">URLs blocked</ui-text>
              <div layout="column gap:2">
                <div layout="column gap">
                  ${tracker.requestsBlocked.map(
                    ({ url }) => html`
                      <panel-copy oncopy="${showCopyNotification}">
                        ${url}
                      </panel-copy>
                    `,
                  )}
                </div>
              </div>
            </div>
          `}
          ${tracker.requestsModified.length > 0 &&
          html`
            <ui-icon name="eye" color="primary-700"></ui-icon>
            <div layout="column gap">
              <ui-text type="label-s">URLs modified</ui-text>
              <div layout="column gap:2">
                <div layout="column gap">
                  ${tracker.requestsModified.map(
                    ({ url }) => html`
                      <panel-copy oncopy="${showCopyNotification}">
                        ${url}
                      </panel-copy>
                    `,
                  )}
                </div>
              </div>
            </div>
          `}
          ${tracker.requestsObserved.length > 0 &&
          html`
            <ui-icon name="shield"></ui-icon>
            <div layout="column gap">
              <ui-text type="label-s">URLs observed</ui-text>
              <div layout="column gap:2">
                <div layout="column gap">
                  ${tracker.requestsObserved.map(
                    ({ url }) => html`
                      <panel-copy oncopy="${showCopyNotification}">
                        ${url}
                      </panel-copy>
                    `,
                  )}
                </div>
              </div>
            </div>
          `}
          ${tracker.organization?.country &&
          html`
            <ui-icon name="pin"></ui-icon>
            <div layout="column gap">
              <ui-text type="label-s">Country</ui-text>
              <ui-text
                type="body-s"
                color="gray-600"
                ellipsis
                layout="padding margin:-1"
              >
                ${labels.regions.of(tracker.organization.country) ||
                tracker.organization.country}
              </ui-text>
            </div>
          `}
          ${tracker.websiteUrl &&
          html`
            <ui-icon name="globe"></ui-icon>
            <div layout="column gap">
              <ui-text type="label-s">Website</ui-text>
              <ui-text
                type="body-s"
                color="primary-700"
                ellipsis
                underline
                layout="padding margin:-1"
              >
                <a href="${tracker.websiteUrl}" onclick="${openTabWithUrl}">
                  ${tracker.websiteUrl}
                </a>
              </ui-text>
            </div>
          `}
          ${tracker.organization &&
          html`
            ${tracker.organization.websiteUrl &&
            html`
              <ui-icon name="globe"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-s">Organization's website</ui-text>
                <ui-text
                  type="body-s"
                  color="primary-700"
                  ellipsis
                  underline
                  layout="padding margin:-1"
                >
                  <a
                    href="${tracker.organization.websiteUrl}"
                    onclick="${openTabWithUrl}"
                  >
                    ${tracker.organization.websiteUrl}
                  </a>
                </ui-text>
              </div>
            `}
            ${tracker.organization.privacyPolicy &&
            html`
              <ui-icon name="privacy"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-s">
                  <!-- | Panel Company -->Privacy policy
                </ui-text>
                <ui-text
                  type="body-s"
                  color="primary-700"
                  ellipsis
                  underline
                  layout="padding margin:-1"
                >
                  <a
                    href="${tracker.organization.privacyPolicy}"
                    onclick="${openTabWithUrl}"
                  >
                    ${tracker.organization.privacyPolicy}
                  </a>
                </ui-text>
              </div>
            `}
            ${tracker.organization.contact &&
            html`
              <ui-icon name="mail"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-s">Contact</ui-text>
                <ui-text
                  type="body-s"
                  color="primary-700"
                  ellipsis
                  underline
                  layout="padding margin:-1"
                >
                  <a
                    href="${tracker.organization.contact.startsWith('http')
                      ? ''
                      : 'mailto:'}${tracker.organization.contact}"
                    onclick="${openTabWithUrl}"
                  >
                    ${tracker.organization.contact}
                  </a>
                </ui-text>
              </div>
            `}
          `}
        </section>
      </panel-dialog>
    </template>
  `,
};
