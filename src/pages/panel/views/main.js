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

import { html, store, router, msg } from 'hybrids';

import { getCurrentTab, openTabWithUrl } from '/utils/tabs.js';

import Options, { getPausedDetails, GLOBAL_PAUSE_ID } from '/store/options.js';
import ElementPickerSelectors from '/store/element-picker-selectors.js';
import TabStats from '/store/tab-stats.js';

import * as exceptions from '/utils/exceptions.js';

import Notification from '../store/notification.js';
import sleep from '../assets/sleep.svg';

import Menu from './menu.js';
import TrackerDetails from './tracker-details.js';
import ProtectionStatus from './protection-status.js';
import ReportForm from './report-form.js';
import ReportConfirm from './report-confirm.js';
import WhoTracksMe from './whotracksme.js';
import ManagedConfig from '/store/managed-config.js';

const SETTINGS_URL = chrome.runtime.getURL(
  '/pages/settings/index.html#@settings-privacy',
);
const ONBOARDING_URL = chrome.runtime.getURL(
  '/pages/onboarding/index.html#@onboarding-views-main?scrollToTop=1',
);

let reloadTimeout;
function reloadTab(host, event) {
  clearTimeout(reloadTimeout);

  event.preventDefault();
  event.stopPropagation();

  reloadTimeout = setTimeout(async () => {
    host.alert = '';

    const tab = await getCurrentTab();
    if (tab) chrome.tabs.reload(tab.id);

    reloadTimeout = null;
  }, 500);
}

async function togglePause(host, event) {
  host.alert = '';

  const { paused, pauseType } = event.target;
  const { options, stats } = host;

  if (paused) {
    const pausedHostname = Object.keys(options.paused)
      .sort((a, b) => b.localeCompare(a))
      .find((domain) => stats.hostname.endsWith(domain));

    store.set(options, {
      paused: { [pausedHostname]: null },
    });
  } else {
    await store.set(options, {
      paused: {
        [stats.hostname]: {
          revokeAt: pauseType && Date.now() + 60 * 60 * 1000 * pauseType,
        },
      },
    });
  }

  host.alert = paused
    ? msg`Ghostery has been resumed on this site.`
    : msg`Ghostery is paused on this site.`;
}

async function revokeGlobalPause(host) {
  const { options } = host;

  host.alert = '';

  await store.set(options, {
    paused: { [GLOBAL_PAUSE_ID]: null },
  });

  host.alert = msg`Ghostery has been resumed.`;
}

function setStatsType(host, event) {
  const { type } = event.target;
  store.set(host.options, { panel: { statsType: type } });
}

function openLogger() {
  const url = chrome.runtime.getURL('/pages/logger/index.html');
  const features = 'toolbar=no,width=1000,height=500';

  window.open(url, 'Ghostery Logger', features);
}

async function openElementPicker() {
  const tab = await getCurrentTab();
  if (tab) {
    await chrome.runtime.sendMessage({
      action: 'openElementPicker',
      tabId: tab.id,
    });
    await chrome.tabs.update(tab.id, {
      active: true,
    });

    window.close();
  }
}

export default {
  [router.connect]: {
    stack: [
      Menu,
      ReportForm,
      ReportConfirm,
      TrackerDetails,
      ProtectionStatus,
      WhoTracksMe,
    ],
  },
  options: store(Options),
  stats: store(TabStats),
  notification: store(Notification),
  managedConfig: store(ManagedConfig),
  elementPickerSelectors: store(ElementPickerSelectors),
  alert: '',
  paused: ({ options, stats }) =>
    store.ready(options, stats) && getPausedDetails(options, stats.hostname),
  globalPause: ({ options }) =>
    store.ready(options) && options.paused[GLOBAL_PAUSE_ID],
  contentBlocksSelectors: ({ elementPickerSelectors, stats }) =>
    (store.ready(stats, elementPickerSelectors) &&
      elementPickerSelectors.hostnames[stats.hostname]?.length) ||
    0,
  render: ({
    options,
    stats,
    notification,
    managedConfig,
    alert,
    paused,
    globalPause,
    contentBlocksSelectors,
  }) => html`
    <template layout="column grow relative">
      ${store.ready(options, stats, managedConfig) &&
      html`
        ${options.terms &&
        html`
          <ui-header>
            ${stats.hostname &&
            managedConfig.disableUserControl &&
            html`<ui-text type="label-m">${stats.displayHostname}</ui-text>`}
            <ui-action slot="icon">
              <a href="https://www.ghostery.com" onclick="${openTabWithUrl}">
                <ui-icon name="logo"></ui-icon>
              </a>
            </ui-action>
            ${!managedConfig.disableUserControl &&
            html`
              <ui-action slot="actions">
                <a href="${router.url(Menu)}" data-qa="button:menu">
                  <ui-icon name="menu" color="primary"></ui-icon>
                </a>
              </ui-action>
            `}
          </ui-header>
          ${stats.hostname &&
          !managedConfig.disableUserControl &&
          html`
            <panel-actions hostname="${stats.displayHostname}">
              <panel-actions-button
                onclick="${openElementPicker}"
                disabled="${paused}"
              >
                <button>
                  <panel-actions-icon
                    name="hide-element"
                    color="success-primary"
                  ></panel-actions-icon>
                  Hide content block
                </button>
              </panel-actions-button>
              <panel-actions-button>
                <a href="${router.url(ReportForm)}">
                  <panel-actions-icon
                    name="report"
                    color="danger-primary"
                  ></panel-actions-icon>
                  Report a broken page
                </a>
              </panel-actions-button>
              <panel-actions-button>
                <a
                  onclick="${openTabWithUrl}"
                  href="${chrome.runtime.getURL(
                    '/pages/settings/index.html#@settings-website-details?domain=' +
                      stats.hostname,
                  )}"
                >
                  <panel-actions-icon
                    name="settings"
                    color="wtm-primary"
                  ></panel-actions-icon>
                  Access website settings
                </a>
              </panel-actions-button>
            </panel-actions>
          `}
        `}
        <section
          id="panel-alerts"
          layout="fixed inset:1 top:0.5 bottom:auto layer:200"
        >
          ${alert &&
          html`
            <panel-alert
              type="danger"
              slide
              autoclose="6"
              onclose="${html.set('alert', '')}"
            >
              ${alert}
              <ui-text type="body-s" layout="block" underline>
                <a
                  href="#"
                  onclick="${reloadTab}"
                  layout="row inline gap:0.5 items:center ::color:inherit"
                  >Reload to see changes</a
                >.
              </ui-text>
            </panel-alert>
          `}
        </section>
        ${options.terms
          ? stats.hostname &&
            !managedConfig.disableUserControl &&
            html`
              <panel-pause
                onaction="${globalPause ? revokeGlobalPause : togglePause}"
                paused="${paused || globalPause}"
                global="${globalPause}"
                revokeAt="${globalPause?.revokeAt || paused?.revokeAt}"
                data-qa="component:pause"
              >
                ${!!paused?.revokeAt &&
                !paused.assist &&
                html`
                  <div layout="row center">
                    <ui-action>
                      <a
                        href="${router.url(ReportForm)}"
                        layout="row center gap padding:0.5:1:1 margin:top:-1"
                      >
                        <ui-text type="body-s">Something wrong?</ui-text>
                        <ui-text
                          type="label-s"
                          layout="row inline items:center gap:0.5"
                        >
                          Report a broken page
                          <ui-icon
                            name="chevron-right"
                            layout="size:1.5"
                          ></ui-icon>
                        </ui-text>
                      </a>
                    </ui-action>
                  </div>
                `}
                ${!!paused?.assist &&
                html`
                  <div layout="row center">
                    <ui-action>
                      <a
                        href="https://www.ghostery.com/blog/browsing-assistant-user-agent"
                        onclick="${openTabWithUrl}"
                        layout="row center gap padding:0.5:1:1 margin:top:-1"
                      >
                        <ui-text type="body-s">Why paused?</ui-text>
                        <ui-text
                          type="label-s"
                          layout="row inline items:center gap:0.5"
                        >
                          Learn more
                          <ui-icon
                            name="chevron-right"
                            layout="size:1.5"
                          ></ui-icon>
                        </ui-text>
                      </a>
                    </ui-action>
                  </div>
                `}
              </panel-pause>
            `
          : html`
              <div layout="::background:danger-primary">
                <ui-button
                  type="danger"
                  layout="height:6 margin:1.5"
                  data-qa="button:enable"
                >
                  <a
                    href="${ONBOARDING_URL}"
                    layout="row center gap:0.5"
                    onclick="${openTabWithUrl}"
                  >
                    <ui-icon name="play"></ui-icon>
                    Enable Ghostery
                  </a>
                </ui-button>
              </div>
            `}
        <panel-container>
          ${stats.hostname
            ? html`
                <ui-stats
                  categories="${stats.topCategories}"
                  type="${options.panel.statsType}"
                  ontypechange="${setStatsType}"
                  layout="margin:1.5:1.5:1"
                >
                  ${options.panel.statsType === 'graph' &&
                  html`
                    <ui-tooltip position="bottom" slot="actions">
                      <span slot="content">WhoTracks.Me Reports</span>
                      <ui-action-button layout="size:4.5">
                        <a href="${router.url(WhoTracksMe)}">
                          <ui-icon name="whotracksme" color="primary"></ui-icon>
                        </a>
                      </ui-action-button>
                    </ui-tooltip>
                  `}
                  ${options.panel.statsType === 'list' &&
                  html`
                    <ui-tooltip position="bottom" slot="actions">
                      <span slot="content" translate="no">Logger</span>
                      <ui-action-button layout="size:4.5">
                        <button onclick="${openLogger}">
                          <ui-icon name="open-book" color="primary"></ui-icon>
                        </button>
                      </ui-action-button>
                    </ui-tooltip>
                  `}
                  ${!stats.groupedTrackers.length &&
                  html`
                    <ui-list layout="grow margin:0.5:0" slot="list">
                      <ui-text
                        type="body-s"
                        color="secondary"
                        layout="grow row center"
                      >
                        No activities detected
                      </ui-text>
                    </ui-list>
                  `}
                  ${stats.groupedTrackers.map(
                    ([name, trackers]) => html`
                      <ui-list
                        name="${name}"
                        layout:last-of-type="margin:bottom:0.5"
                        layout:first-of-type="margin:top:0.5"
                        slot="list"
                      >
                        <div slot="header" layout="row items:center gap">
                          <ui-text type="label-s">${trackers.length}</ui-text>
                        </div>

                        <section layout="column gap:0.5">
                          ${trackers.map(
                            (tracker) => html`
                              <div
                                layout="row gap content:space-between items:center"
                              >
                                <ui-text type="body-s">
                                  <a
                                    href="${router.url(TrackerDetails, {
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
                                    <ui-stats-badge>
                                      ${tracker.requestsCount}
                                    </ui-stats-badge>
                                    ${tracker.blocked &&
                                    html`<ui-icon
                                      name="block-s"
                                      color="danger-primary"
                                      data-qa="icon:tracker:${tracker.id}:blocked"
                                    ></ui-icon>`}
                                    ${tracker.modified &&
                                    html`<ui-icon
                                      name="eye"
                                      color="brand-primary"
                                      data-qa="icon:tracker:${tracker.id}:modified"
                                    ></ui-icon>`}
                                  </a>
                                </ui-text>
                                ${!paused &&
                                !globalPause &&
                                options.terms &&
                                !managedConfig.disableUserControl &&
                                html`
                                  <ui-action-button layout="shrink:0 width:4.5">
                                    <a
                                      href="${router.url(ProtectionStatus, {
                                        trackerId: tracker.id,
                                      })}"
                                      layout="row center relative"
                                    >
                                      <ui-tooltip>
                                        <span slot="content">
                                          ${exceptions.getLabel(
                                            options,
                                            tracker.id,
                                            stats.hostname,
                                          )}
                                        </span>
                                        <div layout="relative">
                                          <ui-icon
                                            name="${exceptions.getStatus(
                                              options,
                                              tracker.id,
                                              stats.hostname,
                                            ).trusted
                                              ? 'trust'
                                              : 'block'}-m"
                                            color="${options.exceptions[
                                              tracker.id
                                            ]
                                              ? 'secondary'
                                              : 'quaternary'}"
                                          ></ui-icon>
                                          ${!exceptions.getStatus(
                                            options,
                                            tracker.id,
                                            stats.hostname,
                                          ).global &&
                                          html`
                                            <ui-icon
                                              name="error"
                                              color="secondary"
                                              layout="absolute right:-4px bottom:-4px"
                                            ></ui-icon>
                                          `}
                                        </div>
                                      </ui-tooltip>
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
                </ui-stats>
                <panel-feedback
                  data-qa="component:feedback"
                  hidden=${paused ||
                  (!stats.trackersBlocked &&
                    !stats.trackersModified &&
                    !contentBlocksSelectors)}
                  layout="margin:1:0:1.5"
                >
                  ${stats.trackersBlocked > 0 &&
                  html`
                    <section layout="column center grow padding:0.5:1">
                      <div layout="row center gap:0.5">
                        <ui-icon
                          name="block-s"
                          color="danger-primary"
                        ></ui-icon>
                        <ui-text type="headline-s">
                          ${stats.trackersBlocked}
                        </ui-text>
                      </div>
                      <ui-text type="label-xs" layout="block:center">
                        Trackers blocked
                      </ui-text>
                    </section>
                  `}
                  ${stats.trackersModified > 0 &&
                  html`
                    <section layout="column center grow padding:0.5:1">
                      <div layout="row center gap:0.5">
                        <ui-icon name="eye" color="brand-primary"></ui-icon>
                        <ui-text type="headline-s">
                          ${stats.trackersModified}
                        </ui-text>
                      </div>
                      <ui-text type="label-xs" layout="block:center">
                        Trackers modified
                      </ui-text>
                    </section>
                  `}
                  ${contentBlocksSelectors > 0 &&
                  html`
                    <ui-action>
                      <a
                        layout="column center grow padding:0.5:1"
                        href="${chrome.runtime.getURL(
                          '/pages/settings/index.html#@settings-website-details?domain=' +
                            stats.hostname,
                        )}"
                        onclick="${openTabWithUrl}"
                      >
                        <div layout="row center gap:0.5">
                          <ui-icon
                            name="hide-element"
                            color="success-primary"
                          ></ui-icon>
                          <ui-text type="headline-s">
                            ${contentBlocksSelectors}
                          </ui-text>
                        </div>
                        <ui-text type="label-xs" layout="block:center">
                          Blocked manually
                        </ui-text>
                      </a>
                    </ui-action>
                  `}
                </panel-feedback>
              `
            : html`
                <div layout="column items:center gap margin:1.5">
                  <img
                    src="${sleep}"
                    alt="Ghosty sleeping"
                    layout="size:160px"
                  />
                  <ui-text
                    type="label-l"
                    layout="block:center width:::210px margin:top"
                  >
                    Ghostery has nothing to do on this page
                  </ui-text>
                  <ui-text type="body-m" layout="block:center width:::245px">
                    Navigate to a website to see Ghostery in action.
                  </ui-text>
                </div>
              `}
          <ui-action
            hidden="${globalPause}"
            inert="${managedConfig.disableUserControl}"
          >
            <a
              href="${options.terms ? SETTINGS_URL : ONBOARDING_URL}"
              class="${{
                last:
                  managedConfig.disableUserControl ||
                  !store.ready(notification),
              }}"
              onclick="${openTabWithUrl}"
              layout="block margin:1.5:1.5:0.5"
              layout.last="margin:bottom:1.5"
            >
              <panel-options-item
                icon="ads"
                enabled="${options.blockAds}"
                terms="${options.terms}"
              >
                Ad-Blocking
              </panel-options-item>
              <panel-options-item
                icon="tracking"
                enabled="${options.blockTrackers}"
                terms="${options.terms}"
              >
                Anti-Tracking
              </panel-options-item>
              <panel-options-item
                icon="autoconsent"
                enabled="${options.blockAnnoyances}"
                terms="${options.terms}"
              >
                Never-Consent
              </panel-options-item>
            </a>
          </ui-action>
        </panel-container>
        ${!managedConfig.disableUserControl &&
        store.ready(notification) &&
        html`
          <panel-notification
            icon="${notification.icon}"
            href="${notification.url}"
            type="${notification.type}"
            layout="width:min:full padding:1:1.5:1.5"
          >
            ${notification.text}
            <span slot="action">${notification.action}</span>
          </panel-notification>
        `}
      `}
    </template>
  `,
};
