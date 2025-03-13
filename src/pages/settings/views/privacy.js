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

import Options, { GLOBAL_PAUSE_ID } from '/store/options.js';
import Session from '/store/session.js';

import assets from '../assets/index.js';
import RegionalFilters from './regional-filters.js';
import ExperimentalFilters from './experimental-filters.js';
import CustomFilters from './custom-filters.js';
import Serp from './serp.js';

function toggleNeverConsent({ options }) {
  store.set(options, {
    blockAnnoyances: !options.blockAnnoyances,
  });
}

function updateGlobalPause({ options }, value, lastValue) {
  if (lastValue === undefined) return;

  store.set(options, {
    paused: {
      [GLOBAL_PAUSE_ID]: value
        ? { revokeAt: Date.now() + 24 * 60 * 60 * 1000 }
        : null,
    },
  });
}

export default {
  [router.connect]: {
    stack: [RegionalFilters, ExperimentalFilters, CustomFilters, Serp],
  },
  options: store(Options),
  session: store(Session),
  devMode: false,
  globalPause: {
    value: false,
    observe: updateGlobalPause,
  },
  globalPauseRevokeAt: {
    value: ({ options }) =>
      store.ready(options) && options.paused[GLOBAL_PAUSE_ID]?.revokeAt,
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
      <settings-page-layout layout="column gap:4">
        ${store.ready(options) &&
        html`
          <section layout="column gap:4">
            <div layout="column gap" layout@992px="margin:bottom">
              <ui-text type="headline-m">Privacy protection</ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="secondary">
                Ghostery protects your privacy by detecting and neutralizing
                different types of data collection including ads, trackers, and
                cookie pop-ups.
              </ui-text>
            </div>
            <ui-toggle
              value="${globalPause}"
              onchange="${html.set('globalPause')}"
              data-qa="toggle:global-pause"
            >
              <div layout="row gap">
                <ui-icon
                  name="pause"
                  color="quaternary"
                  layout="size:3"
                ></ui-icon>
                <div layout="column gap:0.5 grow">
                  <ui-text type="headline-xs">Pause Ghostery</ui-text>
                  <ui-text type="body-m" mobile-type="body-s" color="secondary">
                    Suspends privacy protection globally for 1 day.
                  </ui-text>
                  ${globalPauseRevokeAt &&
                  html`
                    <ui-text type="body-s" color="secondary">
                      <ui-revoke-at
                        revokeAt="${globalPauseRevokeAt}"
                      ></ui-revoke-at>
                    </ui-text>
                  `}
                </div>
              </div>
            </ui-toggle>
            <ui-line></ui-line>
            <div
              layout="column gap:4"
              style="${{ opacity: globalPause ? 0.5 : undefined }}"
              inert="${globalPause}"
            >
              <div layout="column gap:3">
                <ui-toggle
                  disabled="${globalPause}"
                  value="${options.blockAds}"
                  onchange="${html.set(options, 'blockAds')}"
                  data-qa="toggle:ad-blocking"
                >
                  <div layout="row gap">
                    <ui-icon
                      name="ads"
                      color="quaternary"
                      layout="size:3"
                    ></ui-icon>
                    <div layout="column gap:0.5 grow">
                      <ui-text type="headline-xs">Ad-Blocking</ui-text>
                      <ui-text
                        type="body-m"
                        mobile-type="body-s"
                        color="secondary"
                      >
                        Eliminates ads on websites for safe and fast browsing.
                      </ui-text>
                    </div>
                  </div>
                </ui-toggle>
                <ui-toggle
                  disabled="${globalPause}"
                  value="${options.blockTrackers}"
                  onchange="${html.set(options, 'blockTrackers')}"
                  data-qa="toggle:anti-tracking"
                >
                  <div layout="row gap">
                    <ui-icon
                      name="tracking"
                      color="quaternary"
                      layout="size:3"
                    ></ui-icon>
                    <div layout="column grow gap:0.5">
                      <ui-text type="headline-xs">Anti-Tracking</ui-text>
                      <ui-text
                        type="body-m"
                        mobile-type="body-s"
                        color="secondary"
                      >
                        Prevents various tracking techniques using AI-driven
                        technology.
                      </ui-text>
                    </div>
                  </div>
                </ui-toggle>
                <ui-toggle
                  disabled="${globalPause}"
                  value="${options.blockAnnoyances}"
                  onchange="${toggleNeverConsent}"
                  data-qa="toggle:never-consent"
                >
                  <div layout="row gap">
                    <ui-icon
                      name="autoconsent"
                      color="quaternary"
                      layout="size:3"
                    ></ui-icon>
                    <div layout="column grow gap:0.5">
                      <ui-text type="headline-xs">Never-Consent</ui-text>
                      <ui-text
                        type="body-m"
                        mobile-type="body-s"
                        color="secondary"
                      >
                        Automatically rejects cookie consent notices.
                      </ui-text>
                    </div>
                  </div>
                </ui-toggle>
              </div>
              <ui-line></ui-line>
              <ui-toggle
                disabled="${globalPause}"
                value="${options.regionalFilters.enabled}"
                onchange="${html.set(options, 'regionalFilters.enabled')}"
                data-qa="toggle:regional-filters"
              >
                <ui-action>
                  <a
                    href="${router.url(RegionalFilters)}"
                    layout="row gap items:center ::color:primary"
                    layout:hover@hover="::color:brand-primary"
                    data-qa="button:regional-filters"
                  >
                    <ui-icon
                      name="pin"
                      color="quaternary"
                      layout="size:3"
                    ></ui-icon>
                    <ui-text
                      type="headline-xs"
                      color="inherit"
                      layout="row gap:0.5 items:center"
                    >
                      Regional Filters
                      <ui-icon
                        name="chevron-right"
                        color="inherit"
                        layout="size:2"
                      ></ui-icon
                    ></ui-text>
                  </a>
                </ui-action>
              </ui-toggle>
              <ui-toggle
                disabled="${globalPause}"
                value="${options.serpTrackingPrevention}"
                onchange="${html.set(options, 'serpTrackingPrevention')}"
              >
                <ui-action>
                  <a
                    href="${router.url(Serp)}"
                    layout="row gap items:center ::color:primary"
                    layout:hover@hover="::color:brand-primary"
                  >
                    <ui-icon
                      name="search"
                      color="quaternary"
                      layout="size:3"
                    ></ui-icon>
                    <ui-text
                      type="headline-xs"
                      color="inherit"
                      layout="row gap:0.5 items:center"
                    >
                      Search Engine Redirect Protection
                      <ui-icon
                        name="chevron-right"
                        color="inherit"
                        layout="size:2"
                      ></ui-icon
                    ></ui-text>
                  </a>
                </ui-action>
              </ui-toggle>
              <ui-toggle
                disabled="${globalPause}"
                value="${options.experimentalFilters}"
                onchange="${html.set(options, 'experimentalFilters')}"
              >
                <ui-action>
                  <a
                    href="${router.url(ExperimentalFilters)}"
                    layout="row gap items:center ::color:primary"
                    layout:hover@hover="::color:brand-primary"
                  >
                    <ui-icon
                      name="flask"
                      color="quaternary"
                      layout="size:3"
                    ></ui-icon>
                    <ui-text
                      type="headline-xs"
                      color="inherit"
                      layout="row gap:0.5 items:center"
                    >
                      Experimental Filters
                      <ui-icon
                        name="chevron-right"
                        color="inherit"
                        layout="size:2"
                      ></ui-icon
                    ></ui-text>
                  </a>
                </ui-action>
              </ui-toggle>
              <div layout="column gap">
                <ui-toggle
                  disabled="${globalPause}"
                  value="${options.customFilters.enabled}"
                  onchange="${html.set(options, 'customFilters.enabled')}"
                  data-qa="toggle:custom-filters"
                >
                  <ui-action>
                    <a
                      href="${router.url(CustomFilters)}"
                      layout="row gap items:center ::color:primary"
                      layout:hover@hover="::color:brand-primary"
                      data-qa="button:custom-filters"
                    >
                      <ui-icon
                        name="detailed-view"
                        color="quaternary"
                        layout="size:3"
                      ></ui-icon>
                      <ui-text
                        type="headline-xs"
                        color="inherit"
                        layout="row gap:0.5 items:center"
                      >
                        Custom Filters
                        <ui-icon
                          name="chevron-right"
                          color="inherit"
                          layout="size:2"
                        ></ui-icon
                      ></ui-text>
                    </a>
                  </ui-action>
                </ui-toggle>
              </div>
            </div>
          </section>

          <settings-devtools
            onshown="${html.set('devMode', true)}"
            visible="${devMode}"
          ></settings-devtools>
        `}
        ${__PLATFORM__ !== 'safari' &&
        store.ready(session) &&
        html`
          <section
            layout="grid:1/1 grow items:end:stretch padding:0"
            layout@992px="hidden"
          >
            <settings-card
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
                        <ui-text type="body-s" color="secondary">
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
                        <ui-text type="body-s" color="secondary">
                          Help Ghostery fight for a web where privacy is a basic
                          human right.
                        </ui-text>
                      </div>
                      <ui-button type="primary" layout="grow margin:top">
                        <a
                          href="https://www.ghostery.com/become-a-contributor?utm_source=gbe"
                          target="_blank"
                        >
                          Become a Contributor
                        </a>
                      </ui-button>
                    </div>
                  `}
            </settings-card>
          </section>
        `}
      </settings-page-layout>
    </template>
  `,
};
