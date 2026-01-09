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
import { FLAG_REDIRECT_PROTECTION } from '@ghostery/config';

import { longDateFormatter } from '/ui/labels.js';

import Options, { GLOBAL_PAUSE_ID } from '/store/options.js';
import Config from '/store/config.js';

import { debugMode } from '/utils/debug.js';
import { BECOME_A_CONTRIBUTOR_PAGE_URL } from '/utils/urls.js';

import { asyncAction } from '../utils/actions.js';
import assets from '../assets/index.js';

import RegionalFilters from './regional-filters.js';
import ExperimentalFilters from './experimental-filters.js';
import CustomFilters from './custom-filters.js';
import Serp from './serp.js';
import RedirectProtection from './redirect-protection.js';

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

function updateEngines(host, event) {
  asyncAction(event, chrome.runtime.sendMessage({ action: 'updateEngines' }));
}

export default {
  [router.connect]: {
    stack: [
      RegionalFilters,
      ExperimentalFilters,
      CustomFilters,
      Serp,
      RedirectProtection,
    ],
  },
  options: store(Options),
  config: store(Config),
  devMode: debugMode,
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
    config,
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
              <settings-option icon="pause">
                Pause Ghostery
                <span slot="description">
                  Suspends privacy protection globally for 1 day.
                </span>
                ${globalPauseRevokeAt &&
                html`
                  <ui-text type="body-s" color="secondary" slot="footer">
                    <ui-revoke-at
                      revokeAt="${globalPauseRevokeAt}"
                    ></ui-revoke-at>
                  </ui-text>
                `}
              </settings-option>
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
                  <settings-option icon="ads">
                    Ad-Blocking
                    <span slot="description">
                      Eliminates ads on websites for safe and fast browsing.
                    </span>
                  </settings-option>
                </ui-toggle>
                <ui-toggle
                  disabled="${globalPause}"
                  value="${options.blockTrackers}"
                  onchange="${html.set(options, 'blockTrackers')}"
                  data-qa="toggle:anti-tracking"
                >
                  <settings-option icon="tracking">
                    Anti-Tracking
                    <span slot="description">
                      Prevents various tracking techniques using AI-driven
                      technology.
                    </span>
                  </settings-option>
                </ui-toggle>
                <ui-toggle
                  disabled="${globalPause}"
                  value="${options.blockAnnoyances}"
                  onchange="${toggleNeverConsent}"
                  data-qa="toggle:never-consent"
                >
                  <settings-option icon="autoconsent">
                    Never-Consent
                    <span slot="description">
                      Automatically rejects cookie consent notices.
                    </span>
                  </settings-option>
                </ui-toggle>
              </div>
              <ui-line></ui-line>
              <div layout="column gap:3">
                <div layout="grid:1|max content:center gap">
                  <settings-link href="${router.url(Serp)}">
                    <ui-icon
                      name="search"
                      color="quaternary"
                      layout="size:3 margin:right"
                    ></ui-icon>
                    <ui-text
                      type="headline-xs"
                      layout="row gap:0.5 items:center"
                    >
                      Search Engine Redirect Protection </ui-text
                    ><ui-icon
                      name="chevron-right"
                      color="primary"
                      layout="size:2"
                    ></ui-icon>
                  </settings-link>
                  <ui-toggle
                    disabled="${globalPause}"
                    value="${options.serpTrackingPrevention}"
                    onchange="${html.set(options, 'serpTrackingPrevention')}"
                  >
                  </ui-toggle>
                </div>
                <div layout="grid:1|max content:center gap">
                  <settings-link
                    href="${router.url(RegionalFilters)}"
                    data-qa="button:regional-filters"
                  >
                    <ui-icon
                      name="pin"
                      color="quaternary"
                      layout="size:3 margin:right"
                    ></ui-icon>
                    <ui-text
                      type="headline-xs"
                      layout="row gap:0.5 items:center"
                    >
                      Regional Filters
                    </ui-text>
                    <ui-icon
                      name="chevron-right"
                      color="primary"
                      layout="size:2"
                    ></ui-icon>
                  </settings-link>
                  <ui-toggle
                    disabled="${globalPause}"
                    value="${options.regionalFilters.enabled}"
                    onchange="${html.set(options, 'regionalFilters.enabled')}"
                    data-qa="toggle:regional-filters"
                  >
                  </ui-toggle>
                </div>
                <div layout="grid:1|max content:center gap">
                  <settings-link
                    href="${router.url(CustomFilters)}"
                    data-qa="button:custom-filters"
                  >
                    <ui-icon
                      name="detailed-view"
                      color="quaternary"
                      layout="size:3 margin:right"
                    ></ui-icon>
                    <ui-text
                      type="headline-xs"
                      layout="row gap:0.5 items:center"
                    >
                      Custom Filters
                    </ui-text>
                    <ui-icon
                      name="chevron-right"
                      color="primary"
                      layout="size:2"
                    ></ui-icon>
                  </settings-link>
                  <ui-toggle
                    disabled="${globalPause}"
                    value="${options.customFilters.enabled}"
                    onchange="${html.set(options, 'customFilters.enabled')}"
                    data-qa="toggle:custom-filters"
                  >
                  </ui-toggle>
                </div>
                <div layout="grid:1|max content:center gap">
                  <settings-link href="${router.url(ExperimentalFilters)}">
                    <ui-icon
                      name="flask"
                      color="quaternary"
                      layout="size:3 margin:right"
                    ></ui-icon>
                    <ui-text
                      type="headline-xs"
                      layout="row gap:0.5 items:center"
                    >
                      Experimental Filters
                    </ui-text>
                    <ui-icon
                      name="chevron-right"
                      color="primary"
                      layout="size:2"
                    ></ui-icon>
                  </settings-link>
                  <ui-toggle
                    disabled="${globalPause}"
                    value="${options.experimentalFilters}"
                    onchange="${html.set(options, 'experimentalFilters')}"
                  >
                  </ui-toggle>
                </div>
                ${config.hasFlag(FLAG_REDIRECT_PROTECTION) &&
                html`
                  <div layout="grid:1|max content:center gap">
                    <settings-link
                      href="${router.url(RedirectProtection)}"
                      data-qa="button:redirect-protection"
                    >
                      <ui-icon
                        name="globe-lock"
                        color="quaternary"
                        layout="size:3 margin:right"
                      ></ui-icon>
                      <ui-text
                        type="headline-xs"
                        layout="row gap:0.5 items:center"
                      >
                        Redirect Protection
                      </ui-text>
                      <ui-icon
                        name="chevron-right"
                        color="primary"
                        layout="size:2"
                      ></ui-icon>
                    </settings-link>
                    <ui-toggle
                      disabled="${globalPause}"
                      value="${options.redirectProtection.enabled}"
                      onchange="${html.set(
                        options,
                        'redirectProtection.enabled',
                      )}"
                      data-qa="toggle:redirect-protection"
                    >
                    </ui-toggle>
                  </div>
                `}
              </div>
            </div>
          </section>

          <div>
            <settings-devtools
              onshown="${html.set('devMode', true)}"
              visible="${devMode}"
            ></settings-devtools>
            <div layout="row gap items:center">
              <ui-text type="body-m" color="tertiary">
                Last update:
                ${options.filtersUpdatedAt
                  ? longDateFormatter.format(new Date(options.filtersUpdatedAt))
                  : html`updating...`}
              </ui-text>
              <ui-button
                type="outline"
                size="s"
                style="height:26px"
                onclick="${updateEngines}"
                disabled="${!options.filtersUpdatedAt}"
              >
                <button layout="padding:0:1">Update Now</button>
              </ui-button>
            </div>
          </div>
        `}
        <section
          layout="grid:1/1 grow items:end:stretch padding:0"
          layout@992px="hidden"
        >
          <settings-card
            layout="column items:center gap"
            layout@768px="row gap:5"
          >
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
                  Help Ghostery fight for a web where privacy is a basic human
                  right.
                </ui-text>
              </div>
              <ui-button type="primary" layout="grow margin:top">
                <a
                  href="${BECOME_A_CONTRIBUTOR_PAGE_URL}?utm_source=gbe&utm_campaign=privacy-becomeacontributor"
                  target="_blank"
                >
                  Become a Contributor
                </a>
              </ui-button>
            </div>
          </settings-card>
        </section>
      </settings-page-layout>
    </template>
  `,
};
