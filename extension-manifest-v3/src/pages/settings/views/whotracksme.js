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

import Options from '/store/options.js';
import assets from '../assets/index.js';

export default {
  options: store(Options),
  content: ({ options }) => html`
    <template layout="column gap:4 overflow:scroll">
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
          <div layout="column gap:0.5">
            <ui-text type="headline-m" mobile-type="headline-s">
              Browser Settings
            </ui-text>
            <ui-text type="body-l" mobile-type="body-m" color="gray-600">
              Suspendisse feugiat. Nunc nulla. Vivamus consectetuer hendrerit
              lacus. In ut quam vitae odio lacinia tincidunt. Sed cursus turpis
              vitae tortor.
            </ui-text>
          </div>
          <div layout="row gap:2" layout@768px="gap:5">
            <a href="#">
              <ui-settings-help-image layout="size:12:8 shrink:0">
                <img src="${assets.wtm_wheel_small}" alt="Trackers WheelP" />
              </ui-settings-help-image>
            </a>
            <div
              layout="column gap:2"
              layout@768px="row items:center gap:5 grow"
            >
              <div layout="column grow">
                <ui-text type="headline-s">Trackers Wheel</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Praesent egestas tristique nibh. Cras ultricies mi eu turpis
                  hendrerit fringilla.
                </ui-text>
              </div>
              <ui-settings-toggle
                value="${options.trackerWheel}"
                onchange="${html.set(options, 'trackerWheel')}"
              ></ui-settings-toggle>
            </div>
          </div>
        </section>

        <section layout="column gap:4 margin:top:6">
          <div layout="column gap:0.5">
            <ui-text type="headline-l" mobile-type="headline-m">
              Tracker Settings
            </ui-text>
            <ui-text type="body-l" mobile-type="body-m" color="gray-600">
              Vivamus quis mi. Vestibulum ante ipsum primis in faucibus orci
              luctus et ultrices posuere cubilia Curae; Fusce id purus.
            </ui-text>
          </div>
          <div layout="row gap:2" layout@768px="gap:5">
            <a href="#">
              <ui-settings-help-image layout="size:12:8 shrink:0">
                <img
                  src="${assets.trackers_preview_small}"
                  alt="Trackers Preview on SERP"
                />
              </ui-settings-help-image>
            </a>
            <div
              layout="column gap:2"
              layout@768px="row items:center gap:5 grow"
            >
              <div layout="column grow">
                <ui-text type="headline-s">Trackers Preview on SERP</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Praesent egestas tristique nibh. Cras ultricies mi eu turpis
                  hendrerit fringilla.
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
