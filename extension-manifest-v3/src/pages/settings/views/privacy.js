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

import { html, msg, store, router } from 'hybrids';

import Options, { GLOBAL_PAUSE_ID } from '/store/options.js';
import Session from '/store/session.js';

import assets from '../assets/index.js';
import Preview from './preview.js';

const PREVIEWS = {
  'ad_blocking': {
    src: assets.ad_blocking,
    title: msg`Ad-Blocking`,
    description: msg`Eliminates ads on wesbites for safe and fast browsing.`,
  },
  'anti_tracking': {
    src: assets.anti_tracking,
    title: msg`Anti-Tracking`,
    description: msg`Prevents various tracking techniques using AI-driven technology.`,
  },
  'never_consent': {
    src: assets.never_consent,
    title: msg`Never Consent`,
    description: msg`Automatically rejects of cookie consent notices.`,
  },
  'serp_tracking': {
    src: assets.serp_tracking,
    title: msg`Search Engine Redirect Protection`,
    description: msg`Prevent Google from redirecting search result links through their servers instead of linking directly to pages.`,
  },
};

function toggleNeverConsent({ options }) {
  store.set(options, {
    blockAnnoyances: !options.blockAnnoyances,
  });
}

function updateGlobalPause({ options }, value, lastValue) {
  if (lastValue === undefined) return;

  if (!value) {
    store.set(options, {
      paused: options.paused.filter((p) => p.id !== GLOBAL_PAUSE_ID),
    });
  } else if (!options.paused.find((p) => p.id === GLOBAL_PAUSE_ID)) {
    store.set(options, {
      paused: [
        ...options.paused,
        {
          id: GLOBAL_PAUSE_ID,
          revokeAt: Date.now() + 24 * 60 * 60 * 1000,
        },
      ],
    });
  }
}

export default {
  options: store(Options),
  session: store(Session),
  devMode: false,
  globalPause: {
    value: false,
    observe: updateGlobalPause,
  },
  globalPauseRevokeAt: {
    get: ({ options }) =>
      store.ready(options) &&
      options.paused.find((p) => p.id === GLOBAL_PAUSE_ID)?.revokeAt,
    observe: (host, value) => {
      host.globalPause = value;
    },
  },
  content: ({
    options,
    session,
    devMode,
    globalPause,
    globalPauseRevokeAt,
  }) => html`
    <template layout="contents">
      <gh-settings-page-layout layout="column gap:4">
        ${store.ready(options) &&
        html`
          <section layout="column gap:4" layout@768px="gap:4">
            <div layout="column gap" layout@992px="margin:bottom">
              <ui-text type="headline-l" mobile-type="headline-m">
                Privacy protection
              </ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                Ghostery protects your privacy by detecting and neutralizing
                different types of data collection including ads, trackers, and
                cookie pop-ups.
              </ui-text>
            </div>
            <div
              layout="column gap:4"
              layout@768px="gap:4"
              style="${{ opacity: globalPause ? 0.5 : undefined }}"
            >
              <div layout="row items:start gap:2" layout@768px="gap:4">
                <a href="${router.url(Preview, PREVIEWS['ad_blocking'])}">
                  <gh-settings-help-image>
                    <img src="${assets.ad_blocking_small}" alt="Ad-Blocking" />
                  </gh-settings-help-image>
                </a>
                <div layout="column gap:2" layout@768px="row gap:5 grow">
                  <div layout="column gap:0.5 grow">
                    <ui-text type="headline-s">Ad-Blocking</ui-text>
                    <ui-text
                      type="body-l"
                      mobile-type="body-m"
                      color="gray-600"
                    >
                      Eliminates ads on wesbites for safe and fast browsing.
                    </ui-text>
                  </div>
                  <ui-toggle
                    disabled="${globalPause}"
                    value="${options.blockAds}"
                    onchange="${html.set(options, 'blockAds')}"
                  ></ui-toggle>
                </div>
              </div>
              <div layout="row items:start gap:2" layout@768px="gap:4">
                <a href="${router.url(Preview, PREVIEWS['anti_tracking'])}">
                  <gh-settings-help-image>
                    <img
                      src="${assets.anti_tracking_small}"
                      alt="Anti-Tracking"
                    />
                  </gh-settings-help-image>
                </a>
                <div layout="column gap:2" layout@768px="row gap:5 grow">
                  <div layout="column grow gap:0.5">
                    <ui-text type="headline-s">Anti-Tracking</ui-text>
                    <ui-text
                      type="body-l"
                      mobile-type="body-m"
                      color="gray-600"
                    >
                      Prevents various tracking techniques using AI-driven
                      technology.
                    </ui-text>
                  </div>
                  <ui-toggle
                    disabled="${globalPause}"
                    value="${options.blockTrackers}"
                    onchange="${html.set(options, 'blockTrackers')}"
                  ></ui-toggle>
                </div>
              </div>
              <div layout="row items:start gap:2" layout@768px="gap:4">
                <a href="${router.url(Preview, PREVIEWS['never_consent'])}">
                  <gh-settings-help-image>
                    <img
                      src="${assets.never_consent_small}"
                      alt="Never-Consent"
                    />
                  </gh-settings-help-image>
                </a>
                <div layout="column gap:2" layout@768px="row gap:5 grow">
                  <div layout="column grow gap:0.5">
                    <ui-text type="headline-s">Never-Consent</ui-text>
                    <ui-text
                      type="body-l"
                      mobile-type="body-m"
                      color="gray-600"
                    >
                      Automatically rejects of cookie consent notices.
                    </ui-text>
                  </div>
                  <ui-toggle
                    disabled="${globalPause}"
                    value="${options.blockAnnoyances}"
                    onchange="${toggleNeverConsent}"
                  ></ui-toggle>
                </div>
              </div>
            </div>
            <ui-line></ui-line>
            <div layout="row items:start gap:2" layout@768px="gap:4">
              <gh-settings-help-image static>
                <ui-icon
                  name="pause"
                  color="gray-400"
                  layout="size:5"
                ></ui-icon>
              </gh-settings-help-image>
              <div layout="column gap:2" layout@768px="row grow gap:5">
                <div layout="column gap:0.5 grow">
                  <ui-text type="headline-s">
                    <!-- Feature name (capitalized in english) | settings -->
                    Global Pause
                  </ui-text>
                  <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                    Pause Ghostery on all websites for 1&nbsp;day.
                  </ui-text>
                  ${globalPauseRevokeAt &&
                  html`
                    <ui-text type="body-s" color="gray-400">
                      ${html`
                        <ui-text type="body-s" ellipsis
                          ><relative-time
                            date="${new Date(globalPauseRevokeAt)}"
                            format="duration"
                            format-style="narrow"
                            precision="minute"
                            lang="${chrome.i18n.getUILanguage()}"
                          ></relative-time
                        ></ui-text>
                      `}
                      left
                    </ui-text>
                  `}
                </div>
                <ui-toggle
                  type="status"
                  color="danger-500"
                  value="${globalPause}"
                  onchange="${html.set('globalPause')}"
                ></ui-toggle>
              </div>
            </div>
            <ui-line></ui-line>
            <div layout="row items:start gap:2" layout@768px="gap:4">
              <a href="${router.url(Preview, PREVIEWS['serp_tracking'])}">
                <gh-settings-help-image>
                  <img
                    src="${assets.serp_tracking_small}"
                    alt="Serp Tracking"
                  />
                </gh-settings-help-image>
              </a>
              <div layout="column gap:2" layout@768px="row gap:5 grow">
                <div layout="column grow gap:0.5">
                  <ui-text type="headline-s">
                    Search Engine Redirect Protection
                  </ui-text>
                  <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                    Prevent Google from redirecting search result links through
                    their servers instead of linking directly to pages.
                  </ui-text>
                </div>
                <ui-toggle
                  value="${options.serpTrackingPrevention}"
                  onchange="${html.set(options, 'serpTrackingPrevention')}"
                ></ui-toggle>
              </div>
            </div>
          </section>

          <gh-settings-devtools
            onshown="${html.set('devMode', true)}"
            visible="${devMode}"
          ></gh-settings-devtools>
        `}
        ${store.ready(session) &&
        html`
          <section
            layout="grid:1/1 grow items:end:stretch padding:0"
            layout@992px="hidden"
          >
            <gh-settings-card
              layout="column items:center gap"
              layout@768px="row gap:5"
            >
              ${session.contributor
                ? html`
                    <img
                      src="${assets['contributor_badge']}"
                      layout="size:12"
                      alt="Contribution"
                      slot="picture"
                    />
                    <div
                      layout="block:center column gap:0.5"
                      layout@768px="block:left row grow gap:5 content:space-between"
                    >
                      <div layout="column gap:0.5">
                        <ui-text type="label-l" layout="">
                          You are awesome!
                        </ui-text>
                        <ui-text type="body-s" color="gray-600">
                          Thank you for your support in Ghostery's fight for a
                          web where privacy is a basic human right!
                        </ui-text>
                      </div>
                    </div>
                  `
                : html`
                    <img
                      src="${assets['hands']}"
                      layout="size:12"
                      alt="Contribution"
                      slot="picture"
                    />
                    <div
                      layout="block:center column gap:0.5"
                      layout@768px="block:left row grow gap:5 content:space-between"
                    >
                      <div layout="column gap:0.5">
                        <ui-text type="label-l" layout="">
                          Become a Contributor
                        </ui-text>
                        <ui-text type="body-s" color="gray-600">
                          Help Ghostery fight for a web where privacy is a basic
                          human right.
                        </ui-text>
                      </div>
                      <ui-button layout="grow margin:top">
                        <a
                          href="https://www.ghostery.com/become-a-contributor?utm_source=gbe"
                          target="_blank"
                        >
                          Become a Contributor
                        </a>
                      </ui-button>
                    </div>
                  `}
            </gh-settings-card>
          </section>
        `}
      </gh-settings-page-layout>
    </template>
  `,
};
