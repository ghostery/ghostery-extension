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

import { html, msg, store } from 'hybrids';

import Options from '/store/options.js';

export function getDistractionsLabel(options) {
  return msg`Enabled rules: ${Object.values(options.distractions).filter(Boolean).length}`;
}

export default {
  options: store(Options),
  render: ({ options }) => html`
    <template layout="contents">
      <settings-page-layout layout="column gap:4">
        ${store.ready(options) &&
        html`
          <section layout="column gap:4">
            <div layout="column gap" layout@992px="margin:bottom">
              <settings-back-button></settings-back-button>
              <ui-text type="headline-m">Distractions</ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="secondary">
                Remove intrusive prompts and interface clutter for a cleaner browsing experience.
              </ui-text>
            </div>
            <div layout="column gap:5">
              <ui-toggle
                value="${options.distractions.google}"
                onchange="${html.set(options, 'distractions.google')}"
                data-qa="toggle:distractions:google"
              >
                <div layout="column gap:0.5">
                  <div layout="row gap">
                    <ui-text type="label-l">Sign in with Google</ui-text>
                    <ui-text type="body-l" color="secondary">google.com</ui-text>
                  </div>
                  <ui-text type="body-m" color="secondary">
                    Google's identity solution for one-tap or button login.
                  </ui-text>
                </div>
              </ui-toggle>
              <ui-toggle
                value="${options.distractions.reddit}"
                onchange="${html.set(options, 'distractions.reddit')}"
                data-qa="toggle:distractions:reddit"
              >
                <div layout="column gap:0.5">
                  <div layout="row gap">
                    <ui-text type="label-l">Open in app prompt</ui-text>
                    <ui-text type="body-l" color="secondary">reddit.com</ui-text>
                  </div>
                  <ui-text type="body-m" color="secondary">
                    Hide the mobile interstitial that pushes you to install the Reddit app instead
                    of using the website.
                  </ui-text>
                </div>
              </ui-toggle>
            </div>
          </section>
        `}
      </settings-page-layout>
    </template>
  `,
};
