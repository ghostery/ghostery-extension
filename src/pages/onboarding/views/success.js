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

import Options, { MODE_DEFAULT, MODE_ZAP } from '/store/options.js';
import { getBrowser, isMobile } from '/utils/browser-info.js';

import successDefaultImage from '../assets/success-default.svg';
import successZapImage from '../assets/success-zap.svg';
import pinExtensionChrome from '../assets/pin-extension-chrome.jpg';
import pinExtensionEdge from '../assets/pin-extension-edge.jpg';
import pinExtensionOpera from '../assets/pin-extension-opera.jpg';

let screenshotURL = '';
let type = '';

if (__PLATFORM__ !== 'firefox') {
  const { name } = getBrowser();

  if (name === 'chrome' || name === 'brave' || name === 'yandex') {
    screenshotURL = pinExtensionChrome;
    type = 'chrome';
  } else if (name === 'edge' && !isMobile()) {
    screenshotURL = pinExtensionEdge;
    type = 'edge';
  } else if (name === 'opera') {
    screenshotURL = pinExtensionOpera;
    type = 'opera';
  }
}

export default {
  options: store(Options),
  render: ({ options }) => html`
    <template layout="column gap:2 width:::375px">
      <ui-card data-qa="view:success">
        <section layout="block:center column gap:2">
          ${options.mode === MODE_DEFAULT &&
          html`
            <div layout="row center">
              <img src="${successDefaultImage}" layout="size:20" />
            </div>
            <ui-text type="display-s">Setup Successful</ui-text>
            <ui-text>
              Ghostery is all set to stop trackers in their tracks and protect
              your privacy while browsing!
            </ui-text>
          `}
          ${options.mode === MODE_ZAP &&
          html`
            <div layout="row center">
              <img src="${successZapImage}" layout="size:20" />
            </div>
            <ui-text type="display-s">Setup Successful</ui-text>
            <ui-text>
              You’re all set to zap ads away, one site at a time.
            </ui-text>
            <ui-text>
              Open a site, remove ads in Ghostery panel and build your own
              ad-free internet.
            </ui-text>
          `}
        </section>
      </ui-card>
      ${__PLATFORM__ !== 'firefox' &&
      screenshotURL &&
      html`
        <ui-card>
          <section layout="column gap:2">
            <ui-text type="display-xs" layout="block:center">
              What’s next?
            </ui-text>
            <img
              src="${screenshotURL}"
              layout="width:::full"
              style="border-radius:8px; overflow:hidden;"
            />
            <div layout="row items:center gap">
              <ui-icon
                name="extension-${type}"
                layout="block inline size:3"
                color="tertiary"
              ></ui-icon>
              <ui-text type="label-m">Pin Extension for easy access</ui-text>
            </div>
            <ui-text>
              Click the puzzle icon next to the search bar and pin Ghostery to
              your toolbar.
            </ui-text>
            <ui-text>
              Ghostery will show how many trackers were blocked on a page.
              Clicking on the Ghostery icon reveals more detailed information.
            </ui-text>
          </section>
        </ui-card>
        <onboarding-pin-it browser="${type}"> Pin it here </onboarding-pin-it>
      `}
    </template>
  `,
};
