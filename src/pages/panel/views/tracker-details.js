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
import * as labels from '/ui/labels.js';

import Options, { getPausedDetails } from '/store/options.js';
import TabStats from '/store/tab-stats.js';
import ManagedConfig from '/store/managed-config.js';

import * as exceptions from '/utils/exceptions.js';
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
    <panel-alert
      type="success"
      slide
      autoclose="2"
      onclose="${(_, e) => e.target.remove()}"
    >
      Copied to clipboard
    </panel-alert>
  `(wrapper);

  host.querySelector('#panel-company-alerts').appendChild(wrapper);
}

export default {
  [router.connect]: { dialog: true },
  options: store(Options),
  stats: store(TabStats),
  managedConfig: store(ManagedConfig),
  trackerId: '',
  tracker: ({ stats, trackerId }) =>
    stats.trackers.find((t) => t.id === trackerId),
  exceptionStatus: ({ options, stats, tracker }) =>
    exceptions.getStatus(options, tracker.id, stats.hostname),
  exceptionLabel: ({ options, stats, tracker }) =>
    exceptions.getLabel(options, tracker.id, stats.hostname),
  wtmUrl: ({ tracker }) =>
    tracker.category !== 'unidentified' &&
    `https://www.ghostery.com/whotracksme/trackers/${tracker.id}`,
  paused: ({ options, stats }) =>
    store.ready(options, stats) && !!getPausedDetails(options, stats.hostname),
  render: ({
    options,
    managedConfig,
    tracker,
    exceptionStatus,
    exceptionLabel,
    wtmUrl,
    paused,
  }) => html`
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
          <ui-text slot="header" type="body-s" color="secondary">
            ${tracker.company &&
            tracker.company !== tracker.name &&
            tracker.company + ' •'}
            ${labels.categories[tracker.category]}
          </ui-text>
        </div>
        ${options.terms &&
        !managedConfig.disableUserControl &&
        html`
          <div
            layout="grid:1|max gap:0.5 padding:1.5 margin:-2 ::background:secondary"
          >
            ${paused
              ? html`
                  <ui-button layout="width:full height:auto:6" disabled>
                    <div layout="row gap">
                      <ui-icon name="pause" color="inherit"></ui-icon>
                      <ui-text type="label-m" color="inherit">
                        Ghostery paused
                      </ui-text>
                    </div>
                  </ui-button>
                `
              : html`<ui-button layout="width:full height:auto:6">
                  <a
                    href="${router.url(ProtectionStatus, {
                      trackerId: tracker.id,
                    })}"
                    layout="row gap padding:0:1.5"
                  >
                    <ui-icon
                      name="${exceptionStatus.trusted ? 'trust' : 'block'}-m"
                      color="secondary"
                      layout="size:2"
                    ></ui-icon>
                    <ui-text
                      type="label-m"
                      layout="block:center row gap center padding:2px:0"
                    >
                      ${exceptionLabel}
                    </ui-text>
                  </a>
                </ui-button>`}
            ${tracker.category !== 'unidentified' &&
            html`
              <ui-button layout="width:6 height:auto:6">
                <a
                  href="${chrome.runtime.getURL(
                    `/pages/settings/index.html#@settings-tracker-details?tracker=${tracker.id}`,
                  )}"
                  onclick="${openTabWithUrl}"
                >
                  <ui-icon name="settings-m" layout="size:2"></ui-icon>
                </a>
              </ui-button>
            `}
          </div>
          <ui-line layout="margin:0:-2"></ui-line>
        `}
        ${(store.ready(tracker.organization) || wtmUrl) &&
        html`
          <div layout="column gap:0.5">
            ${store.ready(tracker.organization) &&
            tracker.organization.description &&
            html`
              <ui-text type="body-s">
                ${cleanUp(tracker.organization?.description)}
              </ui-text>
            `}
            ${wtmUrl &&
            html`
              <ui-text type="label-xs" color="brand-primary" underline>
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
            <ui-icon name="block-s" color="danger-primary"></ui-icon>
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
            <ui-icon name="eye" color="brand-primary"></ui-icon>
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
          ${store.ready(tracker.organization) &&
          tracker.organization.country &&
          html`
            <ui-icon name="pin"></ui-icon>
            <div layout="column gap">
              <ui-text type="label-s">Country</ui-text>
              <ui-text
                type="body-s"
                color="secondary"
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
                color="brand-primary"
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
          ${store.ready(tracker.organization) &&
          html`
            ${tracker.organization.websiteUrl &&
            html`
              <ui-icon name="globe"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-s">Organization's website</ui-text>
                <ui-text
                  type="body-s"
                  color="brand-primary"
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
                <ui-text type="label-s">Privacy policy</ui-text>
                <ui-text
                  type="body-s"
                  color="brand-primary"
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
                  color="brand-primary"
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
