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

import { html, router, store } from 'hybrids';
import * as labels from '@ghostery/ui/labels';

import Options from '/store/options.js';
import TabStats from '/store/tab-stats.js';

import { openTabWithUrl } from '/utils/tabs.js';

import ProtectionStatus from './protection-status.js';

function cleanUp(text) {
  return text.replace(/(\\"|\\n|\\t|\\r)/g, '').trim();
}

function showCopyNotification(host) {
  const wrapper = document.createDocumentFragment();

  Array.from(
    host.querySelectorAll('#gh-panel-company-alerts gh-panel-alert'),
  ).forEach((el) => el.parentNode.removeChild(el));

  html`
    <gh-panel-alert type="success" slide autoclose="2">
      Copied to clipboard
    </gh-panel-alert>
  `(wrapper);

  host.querySelector('#gh-panel-company-alerts').appendChild(wrapper);
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
    store.ready(options, stats) &&
    options.paused.find(({ id }) => id === stats.hostname),
  content: ({ tracker, status, wtmUrl, paused, options }) => html`
    <template layout="column">
      <gh-panel-dialog>
        <div
          id="gh-panel-company-alerts"
          layout="absolute inset:1 bottom:auto"
        ></div>
        <ui-text slot="header" type="label-l">${tracker.name}</ui-text>

        <ui-text slot="header" type="body-s" color="gray-600">
          ${tracker.company &&
          tracker.company !== tracker.name &&
          tracker.company + ' •'}
          ${labels.categories[tracker.category]}
        </ui-text>
        ${options.terms &&
        html`
          <div layout="grid:1|max gap">
            ${paused
              ? html`
                  <ui-panel-action layout="width:full" disabled>
                    <div layout="row gap">
                      <ui-icon name="pause"></ui-icon>
                      <ui-text type="label-m">Ghostery paused</ui-text>
                    </div>
                  </ui-panel-action>
                `
              : html`<ui-panel-action layout="width:full height:auto:4.5">
                  <a
                    href="${router.url(ProtectionStatus, {
                      trackerId: tracker.id,
                    })}"
                    layout="row gap padding:0:1.5"
                  >
                    <ui-icon
                      name="${status.type}-m"
                      color="${status.type === 'block'
                        ? 'gray-800'
                        : 'success-500'}"
                    ></ui-icon>
                    <ui-text
                      type="label-m"
                      layout="block:center row gap center padding:2px:0"
                    >
                      ${status.website
                        ? (status.type === 'trust' &&
                            html`Trusted on this website`) ||
                          (status.type === 'block' &&
                            html`Blocked on this website`)
                        : (status.type === 'trust' &&
                            html`Trusted on all websites`) ||
                          (status.type === 'block' &&
                            html`Blocked on all websites`)}
                    </ui-text>
                  </a>
                </ui-panel-action>`}
            ${tracker.category !== 'unidentified' &&
            html`
              <ui-panel-action layout="width:4.5 height:auto:4.5">
                <a
                  href="${chrome.runtime.getURL(
                    `/pages/settings/index.html#@gh-settings-tracker-details?tracker=${tracker.id}`,
                  )}"
                  onclick="${openTabWithUrl}"
                >
                  <ui-icon name="settings-m"></ui-icon>
                </a>
              </ui-panel-action>
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
                    ({ url }) =>
                      html`
                        <gh-panel-copy oncopy="${showCopyNotification}">
                          ${url}
                        </gh-panel-copy>
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
                    ({ url }) =>
                      html`
                        <gh-panel-copy oncopy="${showCopyNotification}">
                          ${url}
                        </gh-panel-copy>
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
                    ({ url }) =>
                      html`
                        <gh-panel-copy oncopy="${showCopyNotification}">
                          ${url}
                        </gh-panel-copy>
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
      </gh-panel-dialog>
    </template>
  `,
};
