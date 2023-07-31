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

import Options from '/store/options.js';
import Session from '/store/session.js';
import TabStats from '/store/tab-stats.js';

import { openTabWithUrl } from '/utils/tabs.js';

import sleep from '../assets/sleep.svg';

import Navigation from './navigation.js';
import TrackerDetails from './tracker-details.js';

const NOTIFICATIONS = [
  {
    icon: 'triangle',
    type: 'warning',
    text: 'Due to browser restrictions and additional permissions missing, Ghostery is not able to protect you.',
    url:
      __PLATFORM__ === 'safari'
        ? 'https://www.ghostery.com/blog/how-to-install-extensions-in-safari?utm_source=gbe'
        : 'https://www.ghostery.com/support?utm_source=gbe',
    action: 'Get help',
  },
  __PLATFORM__ !== 'safari'
    ? {
        icon: 'heart',
        type: '',
        text: 'Hey, do you enjoy Ghostery and want to support our work?',
        url: 'https://www.ghostery.com/become-a-contributor?utm_source=gbe',
        action: 'Become a Contributor',
      }
    : null,
];

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

const trackerStatus = ({ count, title, description, icon, iconColor }) => html`
  <section layout="column center grow">
    <div layout="row center">
      <ui-icon name=${icon} color=${iconColor}></ui-icon>
      <strong class="stats-number"
        >${count}</strong
      >
    </div>
    <div layout="row center">
      <strong class="stats-description">${title}</strong>
      <ui-tooltip wrap autohide="10">
        <span slot="content" layout="block width:200px">
          ${description}
        </span>
        <ui-icon
          name="info"
          color="gray-400"
          layout="size:2"
        ></ui-icon>
      </ui-tooltip>
    </div>
  </section>
  </section>
`;

export default {
  [router.connect]: { stack: [Navigation, TrackerDetails] },
  options: store(Options),
  stats: store(TabStats),
  session: store(Session),
  notification: ({ options, session }) =>
    store.ready(options, session) &&
    !session.contributor &&
    NOTIFICATIONS[options.terms ? 1 : 0],
  content: ({ options, stats, notification }) => html`
    <template layout="column relative">
      ${store.ready(options) &&
      (store.ready(stats) || store.error(stats)) &&
      html`
        ${options.terms
          ? html`
              <ui-panel-header layout="fixed top left width:full">
                ${store.ready(stats) && stats.domain}
                <ui-action slot="icon">
                  <a
                    href="https://www.ghostery.com"
                    onclick="${openTabWithUrl}"
                  >
                    <ui-icon name="logo"></ui-icon>
                  </a>
                </ui-action>
                <ui-action slot="actions">
                  <a href="${router.url(Navigation)}">
                    <ui-icon name="menu" color="gray-900"></ui-icon>
                  </a>
                </ui-action>
              </ui-panel-header>
            `
          : html`
              <gh-panel-alert
                type="info"
                icon="logo"
                layout="absolute inset bottom:auto margin"
              >
                Additional Permissions Required <br />
                <a href="${ONBOARDING_URL}" onclick="${openTabWithUrl}">
                  Enable Ghostery
                </a>
              </gh-panel-alert>
            `}
        <section
          id="gh-panel-alerts"
          layout="fixed inset:1 bottom:auto layer:200"
        ></section>
        <section layout="column margin:7:0:1">
          ${!options.terms &&
          html`
            <gh-panel-button>
              <a
                href="${chrome.runtime.getURL('/pages/onboarding/index.html')}"
                layout="row center gap:0.5"
                onclick="${openTabWithUrl}"
              >
                <ui-icon name="pause"></ui-icon>
                Enable Ghostery
              </a>
            </gh-panel-button>
          `}
          ${!store.ready(stats) &&
          store.error(stats) &&
          html`
            <div layout="column items:center gap margin:2:0:3">
              <img src="${sleep}" alt="Ghosty sleeping" layout="size:160px" />
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
          ${store.ready(stats) &&
          html`
            ${options.terms &&
            options.paused &&
            html`
              <gh-panel-pause
                onaction="${togglePause}"
                paused="${options.paused.find(({ id }) => id === stats.domain)}"
              ></gh-panel-pause>
            `}
            <ui-panel-stats
              domain="${stats.domain}"
              categories="${stats.categories}"
              trackers="${stats.trackers}"
              dialog="${TrackerDetails}"
              type="${options.panel.statsType}"
              layout="margin:2"
              ontypechange="${setStatsType}"
            >
            </ui-panel-stats>
          `}
          ${store.ready(stats) &&
          (stats.trackersBlockedCount > 0 || stats.trackersModifiedCount > 0) &&
          html`
            <section layout="row padding:2:2:2" class="stats">
              ${stats.trackersBlockedCount > 0 &&
              trackerStatus({
                count: stats.trackersBlockedCount,
                title: msg`Trackers blocked`,
                description: msg`Number of trackers blocked.`,
                icon: 'block',
                iconColor: 'danger-700',
              })}
              ${stats.trackersModifiedCount > 0 &&
              trackerStatus({
                count: stats.trackersModifiedCount,
                title: msg`Trackers modified`,
                description: msg`Number of trackers modified.`,
                icon: 'eye',
                iconColor: 'primary-700',
              })}
            </section>
          `}

          <gh-panel-options>
            <span slot="header">Ghostery settings</span>
            <ui-text color="gray-900">
              <a
                href="${options.terms ? SETTINGS_URL : ONBOARDING_URL}"
                onclick="${openTabWithUrl}"
                layout="block"
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
          </gh-panel-options>
          ${notification &&
          html`
            <div layout="padding:0:2:1 width:min:full">
              <gh-panel-notification
                icon="${notification.icon}"
                href="${notification.url}"
                type="${notification.type}"
                onclick="${openTabWithUrl}"
              >
                ${notification.text}
                <span slot="action">${notification.action}</span>
              </gh-panel-notification>
            </div>
          `}
        </section>
      `}
    </template>
  `.css`
    .stats {
      background-color: #F0F2F7;
    }
    .stats-number {
      font-size: 24px;
      font-weight: 600;
      line-height: 32px;
      margin-left: 4px;
    }
    .stats-description {
      font-family: Inter;
      font-size: 11px;
      font-weight: 600;
      line-height: 13px;
      margin-right: 4px;
    }
  `,
};
