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

import Config from '/store/config.js';
import Options, { GLOBAL_PAUSE_ID, MODE_ZAP } from '/store/options.js';

import { BECOME_A_CONTRIBUTOR_PAGE_URL } from '/utils/urls.js';

import { asyncAction } from '../utils/actions.js';
import assets from '../assets/index.js';

import AdditionalFilters, { getAdditionalFiltersLabel } from './additional-filters.js';
import RedirectProtection, { getRedirectProtectionLabel } from './redirect-protection.js';

function toggleNeverConsent({ options }) {
  store.set(options, {
    blockAnnoyances: !options.blockAnnoyances,
  });
}

function updateGlobalPause({ options }, value, lastValue) {
  if (lastValue === undefined) return;

  store.set(options, {
    paused: {
      [GLOBAL_PAUSE_ID]: value ? { revokeAt: Date.now() + 24 * 60 * 60 * 1000 } : null,
    },
  });
}

function updateEngines(host, event) {
  asyncAction(event, chrome.runtime.sendMessage({ action: 'updateEngines' }));
}

export default {
  [router.connect]: {
    stack: [AdditionalFilters, RedirectProtection],
  },
  options: store(Options),
  config: store(Config),
  devMode: __DEBUG__,
  globalPause: {
    value: false,
    observe: updateGlobalPause,
  },
  globalPauseRevokeAt: {
    value: ({ options }) => store.ready(options) && options.paused[GLOBAL_PAUSE_ID]?.revokeAt,
    observe: (host, value) => {
      host.globalPause = value;
    },
  },
  render: ({ options, config, devMode, globalPause, globalPauseRevokeAt }) => html`
    <template layout="contents">
      <settings-page-layout layout="column gap:4">
        ${store.ready(options) &&
        html`
          <section layout="column gap:4">
            <div layout="column gap" layout@992px="margin:bottom">
              <ui-text type="headline-m">Privacy protection</ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="secondary">
                Ghostery protects your privacy by detecting and neutralizing different types of data
                collection including ads, trackers, and cookie pop-ups.
              </ui-text>
            </div>
            <settings-toggle
              icon="pause"
              value="${globalPause}"
              onchange="${html.set('globalPause')}"
              data-qa="toggle:global-pause"
              layout@768px="margin:bottom:-3"
            >
              Pause Ghostery
              <span slot="description">Suspends privacy protection globally for 1 day.</span>
              ${globalPauseRevokeAt &&
              html`
                <ui-text type="body-s" color="secondary" slot="footer">
                  <ui-revoke-at revokeAt="${globalPauseRevokeAt}"></ui-revoke-at>
                </ui-text>
              `}
            </settings-toggle>
            <div
              layout="column gap:5"
              style="${{ opacity: globalPause ? 0.5 : undefined }}"
              inert="${globalPause}"
            >
              <div layout="column gap" layout@768px="grid:3">
                <settings-toggle
                  icon="block-ads"
                  value="${options.blockAds}"
                  onchange="${html.set(options, 'blockAds')}"
                  data-qa="toggle:ad-blocking"
                >
                  Ad-Blocking
                  <span slot="description">
                    Eliminates ads on websites for safe and fast browsing.
                  </span>
                </settings-toggle>
                <settings-toggle
                  icon="anti-tracking"
                  value="${options.blockTrackers}"
                  onchange="${html.set(options, 'blockTrackers')}"
                  data-qa="toggle:anti-tracking"
                >
                  Anti-Tracking
                  <span slot="description">
                    Prevents various tracking techniques using AI-driven technology.
                  </span>
                </settings-toggle>
                <settings-toggle
                  icon="never-consent"
                  value="${options.blockAnnoyances}"
                  onchange="${toggleNeverConsent}"
                  data-qa="toggle:never-consent"
                >
                  Never-Consent
                  <span slot="description">Automatically rejects cookie consent notices.</span>
                </settings-toggle>
              </div>
              <div layout="column gap">
                ${config.hasFlag(FLAG_REDIRECT_PROTECTION) &&
                options.mode !== MODE_ZAP &&
                html`
                  <settings-link
                    href="${router.url(RedirectProtection)}"
                    icon="redirect-protection"
                    data-qa="button:redirect-protection"
                  >
                    Redirect Protection
                    <ui-text slot="footer" color="tertiary">
                      ${getRedirectProtectionLabel(options)}
                    </ui-text>
                  </settings-link>
                `}

                <settings-link
                  href="${router.url(AdditionalFilters)}"
                  data-qa="button:custom-filters"
                  icon="detailed-view"
                >
                  Additional Filters
                  <ui-text slot="footer" color="tertiary">
                    ${getAdditionalFiltersLabel(options)}
                  </ui-text>
                </settings-link>
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
        <section layout="grid:1/1 grow items:end:stretch padding:0" layout@992px="hidden">
          <settings-card static>
            <div layout="column items:center gap padding:2" layout@768px="row gap:5">
              <img src="${assets['hands']}" layout="size:12" alt="Contribution" />
              <div
                layout="block:center column gap:0.5"
                layout@768px="block:left row grow gap:5 content:space-between"
              >
                <div layout="column gap:0.5">
                  <ui-text type="label-l" layout=""> Become a Contributor </ui-text>
                  <ui-text type="body-s" color="secondary">
                    Help Ghostery fight for a web where privacy is a basic human right.
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
            </div>
          </settings-card>
        </section>
      </settings-page-layout>
    </template>
  `,
};
