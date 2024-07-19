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

import { openTabWithUrl } from '/utils/tabs.js';

import Options, { GLOBAL_PAUSE_ID } from '/store/options.js';
import TabStats from '/store/tab-stats.js';

import Notification from '../store/notification.js';

import sleep from '../assets/sleep.svg';

import Navigation from './navigation.js';
import TrackerDetails from './tracker-details.js';
import ProtectionStatus from './protection-status.js';

const SETTINGS_URL = chrome.runtime.getURL(
  '/pages/settings/index.html#@gh-settings-privacy',
);
const ONBOARDING_URL = chrome.runtime.getURL('/pages/onboarding/index.html');

function showAlert(host, message) {
  Array.from(host.querySelectorAll('#gh-panel-alerts gh-panel-alert')).forEach(
    (el) => el.parentNode.removeChild(el),
  );

  const wrapper = document.createDocumentFragment();

  html`
    <gh-panel-alert type="info" slide autoclose="5">
      ${message}
    </gh-panel-alert>
  `(wrapper);

  host.querySelector('#gh-panel-alerts').appendChild(wrapper);
}

function reloadTab() {
  setTimeout(async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.reload(tab.id);
  }, 1000);
}

async function togglePause(host, event) {
  const { paused, pauseType } = event.target;

  await store.set(host.options, {
    paused: {
      [host.stats.hostname]: !paused
        ? { revokeAt: pauseType && Date.now() + 60 * 60 * 1000 * pauseType }
        : null,
    },
  });

  reloadTab();

  showAlert(
    host,
    paused
      ? msg`Ghostery has been resumed on this site.`
      : msg`Ghostery is paused on this site.`,
  );
}

function revokeGlobalPause(host) {
  const { options } = host;

  store.set(options, {
    paused: { [GLOBAL_PAUSE_ID]: null },
  });

  reloadTab();

  showAlert(host, msg`Ghostery has been resumed.`);
}

function setStatsType(host, event) {
  const { type } = event.target;
  store.set(host.options, { panel: { statsType: type } });
}

export default {
  [router.connect]: { stack: [Navigation, TrackerDetails, ProtectionStatus] },
  options: store(Options),
  stats: store(TabStats),
  notification: store(Notification),
  paused: ({ options, stats }) =>
    store.ready(options, stats) && !!options.paused[stats.hostname],
  globalPause: ({ options }) =>
    store.ready(options) && options.paused[GLOBAL_PAUSE_ID],
  render: ({ options, stats, notification, paused, globalPause }) => html`
    <template layout="column grow relative">
      ${store.ready(options, stats) &&
      html`
        ${options.terms &&
        html`
          <ui-panel-header>
            ${store.ready(stats) && stats.hostname}
            <ui-action slot="icon">
              <a href="https://www.ghostery.com" onclick="${openTabWithUrl}">
                <ui-icon name="logo"></ui-icon>
              </a>
            </ui-action>
            <ui-action slot="actions">
              <a href="${router.url(Navigation)}">
                <ui-icon name="menu" color="gray-900"></ui-icon>
              </a>
            </ui-action>
          </ui-panel-header>
        `}
        <section
          id="gh-panel-alerts"
          layout="fixed inset:1 bottom:auto layer:200"
        ></section>
        ${options.terms
          ? stats.hostname &&
            html`
              <gh-panel-pause
                onaction="${globalPause ? revokeGlobalPause : togglePause}"
                paused="${paused || globalPause}"
                global="${globalPause}"
              >
                <ui-icon
                  name="${globalPause ? 'pause' : 'circle'}"
                  color="gh-panel-action"
                ></ui-icon>
                <ui-text
                  type="label-m"
                  color="gh-panel-action"
                  layout="block:center"
                >
                  ${globalPause && msg`Ghostery is paused`}
                  ${!globalPause &&
                  (paused ? msg`Site is trusted` : msg`Trust this site`)}
                </ui-text>
              </gh-panel-pause>
            `
          : html`
              <gh-panel-button>
                <a
                  href="${chrome.runtime.getURL(
                    '/pages/onboarding/index.html',
                  )}"
                  layout="row center gap:0.5"
                  onclick="${openTabWithUrl}"
                >
                  <ui-icon name="play"></ui-icon>
                  Enable Ghostery
                </a>
              </gh-panel-button>
            `}
        <gh-panel-container>
          ${stats.hostname
            ? html`
                <ui-panel-stats
                  domain="${stats.hostname}"
                  categories="${stats.topCategories}"
                  trackers="${stats.trackers}"
                  paused="${paused || globalPause || !options.terms}"
                  dialog="${TrackerDetails}"
                  exceptionDialog="${ProtectionStatus}"
                  type="${options.panel.statsType}"
                  ontypechange="${setStatsType}"
                  layout="margin:1:1.5"
                  layout@390px="margin:1.5:1.5:2"
                >
                  ${options.terms &&
                  html`
                    <ui-action slot="header">
                      <a
                        href="${chrome.runtime.getURL(
                          '/pages/settings/index.html#@gh-settings-website-details?domain=' +
                            stats.hostname,
                        )}"
                        onclick="${openTabWithUrl}"
                      >
                        <ui-icon
                          name="settings"
                          layout="size:2"
                          color="gray-500"
                        ></ui-icon>
                      </a>
                    </ui-action>
                  `}
                </ui-panel-stats>
                ${!paused &&
                !globalPause &&
                !!(stats.trackersModified || stats.trackersBlocked) &&
                html`
                  <gh-panel-feedback
                    modified=${stats.trackersModified}
                    blocked=${stats.trackersBlocked}
                    layout="margin:bottom:1.5"
                    layout@390px="padding:top padding:bottom:1.5 margin:bottom:2.5"
                  ></gh-panel-feedback>
                `}
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
          <ui-text
            class="${{ last: store.error(notification) }}"
            layout.last="padding:bottom:1.5"
            layout@390px="padding:bottom"
            layout.last@390px="padding:bottom:2.5"
            hidden="${globalPause}"
          >
            <a
              href="${options.terms ? SETTINGS_URL : ONBOARDING_URL}"
              onclick="${openTabWithUrl}"
              layout="block margin:1.5:1.5:0"
            >
              <gh-panel-options-item
                icon="ads"
                enabled="${options.blockAds}"
                terms="${options.terms}"
              >
                Ad-Blocking
              </gh-panel-options-item>
              <gh-panel-options-item
                icon="tracking"
                enabled="${options.blockTrackers}"
                terms="${options.terms}"
              >
                Anti-Tracking
              </gh-panel-options-item>
              <gh-panel-options-item
                icon="autoconsent"
                enabled="${options.blockAnnoyances}"
                terms="${options.terms}"
              >
                Never-Consent
              </gh-panel-options-item>
            </a>
          </ui-text>
        </gh-panel-container>
        ${store.ready(notification) &&
        html`
          <gh-panel-notification
            icon="${notification.icon}"
            href="${notification.url}"
            type="${notification.type}"
            layout="width:min:full padding:1.5"
          >
            ${notification.text}
            <span slot="action">${notification.action}</span>
          </gh-panel-notification>
        `}
      `}
    </template>
  `,
};
