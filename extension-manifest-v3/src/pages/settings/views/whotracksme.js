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
  'wtm_wheel': {
    src: assets['wtm_wheel'],
    title: msg`Trackers Wheel`,
    description: msg`Replaces the Ghostery icon in the browser toolbar with the tracker wheel.`,
  },
  'trackers_count': {
    src: assets['trackers_count'],
    title: msg`Trackers Count`,
    description: msg`Displays the tracker count on the Ghostery icon in the browser toolbar.`,
  },
  'trackers_preview': {
    src: assets['trackers_preview'],
    title: msg`Trackers Preview`,
    description: msg`Shows the tracker preview beside search results.`,
  },
};

export default {
  options: store(Options),
  content: ({ options }) => html`
    <template layout="column gap:4" layout@768px="gap:5">
      <div layout="column gap" layout@992px="margin:bottom">
        <ui-text type="headline-l" mobile-type="headline-m" translate="no">
          WhoTracks.Me
        </ui-text>
        <ui-text type="body-l" mobile-type="body-m" color="gray-600">
          WhoTracks.Me, operated by Ghostery, is an integral part of Ghostery’s
          AI anti-tracking technology. It is a comprehensive global resource on
          trackers, bringing transparency to web tracking.
        </ui-text>
        <ui-text type="body-l" mobile-type="body-m" color="gray-600">
          It exists thanks to micro-contributions of every Ghostery user who
          chooses to send non-personal information to WhoTracks.Me. The input
          enables Ghostery to provide real-time intel on trackers which in turn
          provides protection to the entire Ghostery community.
        </ui-text>
      </div>
      ${store.ready(options) &&
      html`
        <section layout="column gap:4">
          <div layout="row gap:2" layout@768px="gap:5">
            <a href="${router.url(Preview, PREVIEWS['wtm_wheel'])}">
              <gh-settings-help-image>
                <img src="${assets.wtm_wheel_small}" alt="WhoTracks.Me Wheel" />
              </gh-settings-help-image>
            </a>
            <div layout="column gap:2" layout@768px="row gap:5 grow">
              <div layout="column grow gap:0.5">
                <ui-text type="headline-s">WhoTracks.Me Wheel</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Replaces the Ghostery icon in the browser toolbar with the
                  tracker wheel.
                </ui-text>
              </div>
              <ui-toggle
                value="${options.trackerWheel}"
                onchange="${html.set(options, 'trackerWheel')}"
              ></ui-toggle>
            </div>
          </div>
          ${Options.trackerCount &&
          html`
            <div layout="row gap:2" layout@768px="gap:5">
              <a href="${router.url(Preview, PREVIEWS['trackers_count'])}">
                <gh-settings-help-image>
                  <img
                    src="${assets.trackers_count_small}"
                    alt="Trackers Count"
                  />
                </gh-settings-help-image>
              </a>
              <div layout="column gap:2" layout@768px="row gap:5 grow">
                <div layout="column grow gap:0.5">
                  <ui-text type="headline-s">Trackers Count</ui-text>
                  <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                    Displays the tracker count on the Ghostery icon in the
                    browser toolbar.
                  </ui-text>
                </div>
                <ui-toggle
                  value="${options.trackerCount}"
                  onchange="${html.set(options, 'trackerCount')}"
                ></ui-toggle>
              </div>
            </div>
          `}
          <div layout="row gap:2" layout@768px="gap:5">
            <a href="${router.url(Preview, PREVIEWS['trackers_preview'])}">
              <gh-settings-help-image>
                <img
                  src="${assets.trackers_preview_small}"
                  alt="Trackers Preview"
                />
              </gh-settings-help-image>
            </a>
            <div layout="column gap:2" layout@768px="row gap:5 grow">
              <div layout="column grow gap:0.5">
                <ui-text type="headline-s">Trackers Preview</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Shows the tracker preview beside search results.
                </ui-text>
                <ui-text type="label-m" color="gray-600" underline>
                  <a
                    href="https://www.ghostery.com/blog/introducing-wtm-serp-report"
                    target="_blank"
                    layout="row gap:0.5"
                  >
                    Learn more <ui-icon name="arrow-right-s"></ui-icon>
                  </a>
                </ui-text>
              </div>
              <ui-toggle
                value="${options.wtmSerpReport}"
                onchange="${html.set(options, 'wtmSerpReport')}"
              ></ui-toggle>
            </div>
          </div>
        </section>
      `}
    </template>
  `,
};
