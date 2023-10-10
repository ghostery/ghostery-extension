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

import { html, store, router } from 'hybrids';

import Options from '/store/options.js';
import TabStats from '/store/tab-stats.js';
import Notification from '../store/notification.js';

import { openTabWithUrl } from '/utils/tabs.js';

import sleep from '../assets/sleep.svg';

import Navigation from './navigation.js';
import TrackerDetails from './tracker-details.js';

const SETTINGS_URL = chrome.runtime.getURL('/pages/settings/index.html');
const ONBOARDING_URL = chrome.runtime.getURL('/pages/onboarding/index.html');

async function togglePause(host, event) {
  const { paused, pauseType } = event.target;

  // Update options
  await store.set(host.options, {
    paused: paused
      ? host.options.paused.filter((p) => p.id !== host.stats.domain)
      : [
          ...host.options.paused,
          {
            id: host.stats.domain,
            revokeAt: pauseType && Date.now() + 60 * 60 * 1000 * pauseType,
          },
        ],
  });

  // Reload current tab
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  chrome.tabs.reload(tab.id);

  // Show alert message
  Array.from(host.querySelectorAll('#gh-panel-alerts gh-panel-alert')).forEach(
    (el) => el.parentNode.removeChild(el),
  );

  const wrapper = document.createDocumentFragment();

  html`
    <gh-panel-alert type="success" slide autoclose="5">
      ${paused
        ? html`Ghostery has been resumed on this site.`
        : html`Ghostery is paused on this site.`}
    </gh-panel-alert>
  `(wrapper);

  host.querySelector('#gh-panel-alerts').appendChild(wrapper);
}

function setStatsType(host, event) {
  const { type } = event.target;
  store.set(host.options, { panel: { statsType: type } });
}

export default {
  [router.connect]: { stack: [Navigation, TrackerDetails] },
  options: store(Options),
  stats: store(TabStats),
  notification: store(Notification),
  content: ({ options, stats, notification }) => html`
    <template layout="column grow relative">
      ${store.ready(options, stats) &&
      html`
        ${options.terms &&
        html`
          <ui-panel-header>
            ${store.ready(stats) && stats.domain}
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
          ? stats.domain &&
            html`
              <gh-panel-pause
                onaction="${togglePause}"
                paused="${options.paused.find(({ id }) => id === stats.domain)}"
              ></gh-panel-pause>
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
          ${stats.domain
            ? html`
                <ui-panel-stats
                  domain="${stats.domain}"
                  categories="${stats.topCategories}"
                  trackers="${stats.trackers}"
                  dialog="${TrackerDetails}"
                  type="${options.panel.statsType}"
                  ontypechange="${setStatsType}"
                  layout="margin:1:1.5"
                >
                </ui-panel-stats>
                ${!!(
                  stats.trackersModified.length || stats.trackersBlocked.length
                ) &&
                html`
                  <gh-panel-feedback
                    modified=${stats.trackersModified.length}
                    blocked=${stats.trackersBlocked.length}
                    layout="margin:bottom:1.5"
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
          <ui-text>
            <a
              href="${options.terms ? SETTINGS_URL : ONBOARDING_URL}"
              onclick="${openTabWithUrl}"
              layout="block margin:0:1.5"
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
