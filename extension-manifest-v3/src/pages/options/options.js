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

import { html, define, store } from 'hybrids';

import Options from '/store/options.js';

export default define({
  tag: 'gh-options',
  options: store(Options),
  devtools: true,
  content: ({ options }) => html`
    <template layout="grid height::100%">
      <ui-page-layout>
        <ui-card>
          <ui-text type="display-s" layout="block:center margin:bottom:4">
            Ghostery settings
          </ui-text>
          <section layout="column gap:3">
            ${store.ready(options) &&
            html`
              <section layout="column gap">
                <ui-text type="headline-xs" layout="margin:bottom">
                  User interface
                </ui-text>
                <label layout="row items:center">
                  <ui-text layout="grow">
                    Show Tracker Wheel in the browser toolbar
                  </ui-text>
                  <input
                    type="checkbox"
                    checked="${options.trackerWheel}"
                    onchange="${html.set(options, 'trackerWheel')}"
                    layout="shrink:0 size:2"
                  />
                </label>
                <label layout="row items:center">
                  <ui-text layout="grow">
                    Show Trackers Preview next to search results
                  </ui-text>
                  <input
                    type="checkbox"
                    checked="${options.wtmSerpReport}"
                    onchange="${html.set(options, 'wtmSerpReport')}"
                    layout="shrink:0 size:2"
                  />
                </label>
              </section>
              <gh-options-devtools></gh-options-devtools>
            `}
          </section>
        </ui-card>
      </ui-page-layout>
    </template>
  `.css`
    html, body { height: 100%; }
  `,
});
