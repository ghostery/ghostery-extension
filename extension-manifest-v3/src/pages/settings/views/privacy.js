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

import { html, store } from 'hybrids';

import Options, { GLOBAL_PAUSE_ID } from '/store/options.js';
import Session from '/store/session.js';

import assets from '../assets/index.js';

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
    value: ({ options }) =>
      store.ready(options) &&
      options.paused.find((p) => p.id === GLOBAL_PAUSE_ID)?.revokeAt,
    observe: (host, value) => {
      host.globalPause = value;
    },
  },
  render: ({
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
              <ui-text type="headline-m"> Privacy protection </ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                Ghostery protects your privacy by detecting and neutralizing
                different types of data collection including ads, trackers, and
                cookie pop-ups.
              </ui-text>
            </div>
            <div layout="row items:start gap:2">
              <div layout="column gap:0.5 grow">
                <div layout="row gap items:center">
                  <ui-icon name="pause" color="gray-600"></ui-icon>
                  <ui-text type="headline-xs">Pause Ghostery</ui-text>
                </div>
                <ui-text type="body-m" mobile-type="body-s" color="gray-600">
                  Suspends privacy protection globally for 1 day.
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
            <ui-line></ui-line>
            <div
              layout="column gap:3"
              style="${{ opacity: globalPause ? 0.5 : undefined }}"
            >
              <div layout="row items:start gap:2">
                <div layout="column gap:0.5 grow">
                  <div layout="row gap items:center">
                    <ui-icon name="ads" color="gray-600"></ui-icon>
                    <ui-text type="headline-xs">Ad-Blocking</ui-text>
                  </div>
                  <ui-text type="body-m" mobile-type="body-s" color="gray-600">
                    Eliminates ads on websites for safe and fast browsing.
                  </ui-text>
                </div>
                <ui-toggle
                  disabled="${globalPause}"
                  value="${options.blockAds}"
                  onchange="${html.set(options, 'blockAds')}"
                ></ui-toggle>
              </div>
              <div layout="row items:start gap:2">
                <div layout="column grow gap:0.5">
                  <div layout="row gap items:center">
                    <ui-icon name="tracking" color="gray-600"></ui-icon>
                    <ui-text type="headline-xs">Anti-Tracking</ui-text>
                  </div>
                  <ui-text type="body-m" mobile-type="body-s" color="gray-600">
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
              <div layout="row items:start gap:2">
                <div layout="column grow gap:0.5">
                  <div layout="row gap items:center">
                    <ui-icon name="autoconsent" color="gray-600"></ui-icon>
                    <ui-text type="headline-xs">Never-Consent</ui-text>
                  </div>
                  <ui-text type="body-m" mobile-type="body-s" color="gray-600">
                    Automatically rejects cookie consent notices.
                  </ui-text>
                </div>
                <ui-toggle
                  disabled="${globalPause}"
                  value="${options.blockAnnoyances}"
                  onchange="${toggleNeverConsent}"
                ></ui-toggle>
              </div>
            </div>
            <ui-line></ui-line>
            <div
              layout="row items:start gap:2"
              style="${{ opacity: globalPause ? 0.5 : undefined }}"
            >
              <div layout="column grow gap:0.5">
                <div layout="row gap items:center">
                  <ui-icon name="globe" color="gray-600"></ui-icon>
                  <ui-text type="headline-xs">
                    Search Engine Redirect Protection
                  </ui-text>
                </div>
                <ui-text type="body-m" mobile-type="body-s" color="gray-600">
                  Prevents Google from redirecting search result links through
                  their servers instead of linking directly to pages.
                </ui-text>
              </div>
              <ui-toggle
                disabled="${globalPause}"
                value="${options.serpTrackingPrevention}"
                onchange="${html.set(options, 'serpTrackingPrevention')}"
              ></ui-toggle>
            </div>
            <div layout="row items:start gap:2" layout@768px="gap:4">
              <gh-settings-help-image static>
                <ui-icon
                  name="alert-info"
                  color="gray-400"
                  layout="size:5"
                ></ui-icon>
              </gh-settings-help-image>
              <div layout="column gap:2" layout@768px="row gap:5 grow">
                <div layout="column grow gap:0.5">
                  <ui-text type="headline-s"
                    >Experimental Ad-Blocking Filters</ui-text
                  >
                  <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                    Helps Ghostery fix broken pages faster. By activating you
                    can test experimental filters and support us with feedback.
                    Please send a message to support@ghostery.com describing how
                    your experience changed after enabling.
                  </ui-text>
                  <ui-text type="label-m" color="gray-600" underline>
                    <a
                      href="https://github.com/ghostery/broken-page-reports/blob/main/filters/experimental.txt"
                      target="_blank"
                      layout="row gap:0.5"
                    >
                      Learn more<ui-icon name="arrow-right-s"></ui-icon>
                    </a>
                  </ui-text>
                </div>
                <ui-toggle
                  value="${options.experimentalFilters}"
                  onchange="${html.set(options, 'experimentalFilters')}"
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
