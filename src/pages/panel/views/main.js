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
import { hasWTMStats } from '/utils/wtm-stats.js';
import { WTM_PAGE_URL } from '/utils/urls.js';

import Options, { GLOBAL_PAUSE_ID } from '/store/options.js';
import TabStats from '/store/tab-stats.js';

import Notification from '../store/notification.js';

import sleep from '../assets/sleep.svg';

import Menu from './menu.js';
import TrackerDetails from './tracker-details.js';
import ProtectionStatus from './protection-status.js';
import ReportForm from './report-form.js';
import ReportConfirm from './report-confirm.js';
import { parse } from 'tldts-experimental';

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
  const { paused, pauseType } = event.target;

  host.alert = '';

  await store.set(host.options, {
    paused: {
      [host.stats.hostname]: !paused
        ? { revokeAt: pauseType && Date.now() + 60 * 60 * 1000 * pauseType }
        : null,
    },
  });

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

export default {
  [router.connect]: {
    stack: [Menu, ReportForm, ReportConfirm, TrackerDetails, ProtectionStatus],
  },
  options: store(Options),
  stats: store(TabStats),
  notification: store(Notification),
  alert: '',
  paused: ({ options, stats }) =>
    store.ready(options, stats) && options.paused[stats.hostname],
  globalPause: ({ options }) =>
    store.ready(options) && options.paused[GLOBAL_PAUSE_ID],
  wtmLink: ({ stats }) => {
    if (!store.ready(stats)) return '';

    const { domain } = parse(stats.hostname);
    return hasWTMStats(domain) ? `${WTM_PAGE_URL}/websites/${domain}` : '';
  },
  render: ({
    options,
    stats,
    notification,
    alert,
    paused,
    globalPause,
    wtmLink,
  }) => html`
    <template layout="column grow relative">
      ${store.ready(options, stats) &&
      html`
        ${options.terms &&
        html`
          <ui-header>
            ${stats.hostname &&
            (options.terms
              ? html`
                  <panel-managed managed="${options.managed}">
                    <ui-action>
                      <a
                        href="${chrome.runtime.getURL(
                          '/pages/settings/index.html#@settings-website-details?domain=' +
                            stats.hostname,
                        )}"
                        onclick="${openTabWithUrl}"
                        layout="row gap:2px items:center"
                      >
                        <ui-text type="label-m"
                          >${stats.displayHostname}</ui-text
                        >
                        ${!options.managed &&
                        html`<ui-icon
                          name="arrow-down"
                          layout="size:1.5"
                          color="gray-600"
                        ></ui-icon>`}
                      </a>
                    </ui-action>
                  </panel-managed>
                `
              : stats.displayHostname)}
            <ui-action slot="icon">
              <a href="https://www.ghostery.com" onclick="${openTabWithUrl}">
                <ui-icon name="logo"></ui-icon>
              </a>
            </ui-action>
            <ui-action slot="actions">
              <a href="${router.url(Menu)}" data-qa="button:menu">
                <ui-icon name="menu" color="gray-800"></ui-icon>
              </a>
            </ui-action>
          </ui-header>
        `}
        <section
          id="panel-alerts"
          layout="fixed inset:1 top:0.5 bottom:auto layer:200"
        >
          ${alert &&
          html`
            <panel-alert
              type="info"
              slide
              autoclose="10"
              onclose="${html.set('alert', '')}"
            >
              ${alert}
              <ui-text type="body-s" layout="block" underline>
                <a
                  href="#"
                  onclick="${reloadTab}"
                  layout="row inline gap:0.5 items:center"
                  >Reload to see changes</a
                >.
              </ui-text>
            </panel-alert>
          `}
        </section>
        ${options.terms
          ? stats.hostname &&
            !options.managed &&
            html`
              <panel-pause
                onaction="${globalPause ? revokeGlobalPause : togglePause}"
                paused="${paused || globalPause}"
                global="${globalPause}"
                revokeAt="${globalPause?.revokeAt || paused?.revokeAt}"
                data-qa="component:pause"
              >
                ${!!paused?.revokeAt &&
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
                            name="arrow-right"
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
            `}
        <panel-container>
          ${stats.hostname
            ? html`
                <ui-stats
                  domain="${stats.displayHostname}"
                  categories="${stats.topCategories}"
                  trackers="${stats.trackers}"
                  readonly="${paused ||
                  globalPause ||
                  !options.terms ||
                  options.managed}"
                  dialog="${TrackerDetails}"
                  exceptionDialog="${ProtectionStatus}"
                  type="${options.panel.statsType}"
                  wtm-link="${wtmLink}"
                  layout="margin:1:1.5"
                  layout@390px="margin:1.5:1.5:2"
                  ontypechange="${setStatsType}"
                >
                </ui-stats>
                <panel-feedback
                  modified=${stats.trackersModified}
                  blocked=${stats.trackersBlocked}
                  layout="margin:bottom:1.5"
                  layout@390px="padding:top padding:bottom:1.5 margin:bottom:2.5"
                  data-qa="component:feedback"
                  hidden="${globalPause ||
                  paused ||
                  (!stats.trackersBlocked && !stats.trackersModified)}"
                ></panel-feedback>
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
          <panel-managed managed="${options.managed}">
            <ui-text
              class="${{
                last: options.managed || store.error(notification),
              }}"
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
            </ui-text>
          </panel-managed>
        </panel-container>
        ${!options.managed &&
        store.ready(notification) &&
        html`
          <panel-notification
            icon="${notification.icon}"
            href="${notification.url}"
            type="${notification.type}"
            layout="width:min:full padding:1.5"
          >
            ${notification.text}
            <span slot="action">${notification.action}</span>
          </panel-notification>
        `}
      `}
    </template>
  `,
};
