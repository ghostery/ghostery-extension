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
    description: msg`Replaces Ghostery icon in the browser toolbar`,
  },
  'trackers_count': {
    src: assets['trackers_count'],
    title: msg`Trackers Count`,
    description: msg`Show tracker count badge on the Ghostery icon in browser toolbar`,
  },
  'trackers_preview': {
    src: assets['trackers_preview'],
    title: msg`Trackers Preview`,
    description: msg`Shows statistical information about website tracking on search engine result page`,
  },
};

export default {
  options: store(Options),
  content: ({ options }) => html`
    <template layout="column gap:4" layout@768px="gap:5">
      <div layout="column gap" layout@992px="margin:bottom">
        <ui-text type="headline-l" mobile-type="headline-m">
          WhoTracks.me
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
              <ui-settings-help-image layout="size:12:8 shrink:0">
                <img src="${assets.wtm_wheel_small}" alt="WhoTracks.Me Wheel" />
              </ui-settings-help-image>
            </a>
            <div
              layout="column gap:2"
              layout@768px="row items:center gap:5 grow"
            >
              <div layout="column grow">
                <ui-text type="headline-s">WhoTracks.Me wheel</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Replaces Ghostery icon in the browser toolbar
                </ui-text>
              </div>
              <ui-settings-toggle
                value="${options.trackerWheel}"
                onchange="${html.set(options, 'trackerWheel')}"
              ></ui-settings-toggle>
            </div>
          </div>
          <div layout="row gap:2" layout@768px="gap:5">
            <a href="${router.url(Preview, PREVIEWS['trackers_count'])}">
              <ui-settings-help-image layout="size:12:8 shrink:0">
                <img
                  src="${assets.trackers_count_small}"
                  alt="Trackers Count"
                />
              </ui-settings-help-image>
            </a>
            <div
              layout="column gap:2"
              layout@768px="row items:center gap:5 grow"
            >
              <div layout="column grow">
                <ui-text type="headline-s">Trackers count</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Show tracker count badge on the Ghostery icon in browser
                  toolbar
                </ui-text>
              </div>
              <ui-settings-toggle
                value="${options.wtmSerpReport}"
                onchange="${html.set(options, 'trackerCount')}"
              ></ui-settings-toggle>
            </div>
          </div>
          <div layout="row gap:2" layout@768px="gap:5">
            <a href="${router.url(Preview, PREVIEWS['trackers_preview'])}">
              <ui-settings-help-image layout="size:12:8 shrink:0">
                <img
                  src="${assets.trackers_preview_small}"
                  alt="Trackers Preview"
                />
              </ui-settings-help-image>
            </a>
            <div
              layout="column gap:2"
              layout@768px="row items:center gap:5 grow"
            >
              <div layout="column grow">
                <ui-text type="headline-s">Trackers preview</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Shows statistical information about website tracking on search
                  engine result page
                </ui-text>
              </div>
              <ui-settings-toggle
                value="${options.wtmSerpReport}"
                onchange="${html.set(options, 'wtmSerpReport')}"
              ></ui-settings-toggle>
            </div>
          </div>
        </section>
      `}
    </template>
  `,
};
