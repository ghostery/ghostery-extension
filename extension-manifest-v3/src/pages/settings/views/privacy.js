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

import Options from '/store/options.js';

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
    title: msg`Tracking Prevention on Search Engine Result Pages`,
    description: msg`While using a non-private search engine like Google or Bing, Ghostery detects and displays trackers even before you visit a webpage.`,
  },
};

function toggleNeverConsent({ options }) {
  store.set(options, {
    blockAnnoyances: !options.blockAnnoyances,
    autoconsent: null,
  });
}

export default {
  options: store(Options),
  content: ({ options }) => html`
    <template layout="column gap:4">
      ${store.ready(options) &&
      html`
        <section layout="column gap:4" layout@768px="gap:5">
          <div layout="column gap" layout@992px="margin:bottom">
            <ui-text type="headline-l" mobile-type="headline-m">
              Privacy protection
            </ui-text>
            <ui-text type="body-l" mobile-type="body-m" color="gray-600">
              Ghostery protects your privacy by detecting and neutralizing
              different types of data collection including ads, trackers, and
              cookie pop-ups.
            </ui-text>
            <ui-text type="body-l" mobile-type="body-m" color="gray-600">
              You can adjust the settings below. We recommend keeping them ON at
              all times.
            </ui-text>
          </div>
          <div layout="row items:start gap:2" layout@768px="gap:5">
            <a href="${router.url(Preview, PREVIEWS['ad_blocking'])}">
              <ui-settings-help-image>
                <img src="${assets.ad_blocking_small}" alt="Ad-Blocking" />
              </ui-settings-help-image>
            </a>
            <div
              layout="column gap:2"
              layout@768px="row items:center gap:5 grow"
            >
              <div layout="column gap:0.5 grow">
                <ui-text type="headline-s">Ad-Blocking</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Eliminates ads on wesbites for safe and fast browsing.
                </ui-text>
              </div>
              <ui-settings-toggle
                value="${options.blockAds}"
                onchange="${html.set(options, 'blockAds')}"
              ></ui-settings-toggle>
            </div>
          </div>
          <div layout="row items:start gap:2" layout@768px="gap:5">
            <a href="${router.url(Preview, PREVIEWS['anti_tracking'])}">
              <ui-settings-help-image>
                <img src="${assets.anti_tracking_small}" alt="Anti-Tracking" />
              </ui-settings-help-image>
            </a>
            <div
              layout="column gap:2"
              layout@768px="row items:center gap:5 grow"
            >
              <div layout="column grow gap:0.5">
                <ui-text type="headline-s">Anti-Tracking</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Prevents various tracking techniques using AI-driven
                  technology.
                </ui-text>
              </div>
              <ui-settings-toggle
                value="${options.blockTrackers}"
                onchange="${html.set(options, 'blockTrackers')}"
              ></ui-settings-toggle>
            </div>
          </div>
          <div layout="row items:start gap:2" layout@768px="gap:5">
            <a href="${router.url(Preview, PREVIEWS['never_consent'])}">
              <ui-settings-help-image>
                <img src="${assets.never_consent_small}" alt="Never-Consent" />
              </ui-settings-help-image>
            </a>
            <div
              layout="column gap:2"
              layout@768px="row items:center gap:5 grow"
            >
              <div layout="column grow gap:0.5">
                <ui-text type="headline-s">Never-Consent</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Automatically rejects of cookie consent notices.
                </ui-text>
              </div>
              <ui-settings-toggle
                value="${options.blockAnnoyances}"
                onchange="${toggleNeverConsent}"
              ></ui-settings-toggle>
            </div>
          </div>
          <ui-text type="headline-m" mobile-type="headline-s">
            Further Protection
          </ui-text>
          <div layout="row items:start gap:2" layout@768px="gap:5">
            <a href="${router.url(Preview, PREVIEWS['serp_tracking'])}">
              <ui-settings-help-image>
                <img src="${assets.serp_tracking_small}" alt="Serp Tracking" />
              </ui-settings-help-image>
            </a>
            <div
              layout="column gap:2"
              layout@768px="row items:center gap:5 grow"
            >
              <div layout="column grow gap:0.5">
                <ui-text type="headline-s">
                  Tracking Prevention on Search Engine Result Pages
                </ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  While using a non-private search engine like Google, Ghostery
                  detects and displays trackers even before you visit a webpage.
                </ui-text>
              </div>
              <ui-settings-toggle
                value="${options.serpTrackingPrevention}"
                onchange="${html.set(options, 'serpTrackingPrevention')}"
              ></ui-settings-toggle>
            </div>
          </div>
        </section>

        <gh-settings-devtools></gh-settings-devtools>
      `}
    </template>
  `,
};
