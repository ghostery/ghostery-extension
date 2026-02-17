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

import { lang } from '/ui/labels.js';

import Options, { MODE_DEFAULT, MODE_ZAP } from '/store/options.js';
import { getBrowser, isMobile } from '/utils/browser-info.js';

import modeZapScreenshotUrl from '/ui/assets/lottie-mode-zap.json?url';

import successDefaultImage from '../assets/success-default.svg';

import pinExtensionChrome from '../assets/pin-extension-chrome.jpg';
import pinExtensionEdge from '../assets/pin-extension-edge.jpg';
import pinExtensionOpera from '../assets/pin-extension-opera.jpg';

let screenshotURL = '';
let type = '';

if (__PLATFORM__ !== 'firefox') {
  const { name } = getBrowser();

  if (name === 'chrome' || name === 'yandex' || name === 'oculus') {
    screenshotURL = pinExtensionChrome;
    type = 'chrome';
  } else if (name === 'edge' && !isMobile()) {
    screenshotURL = pinExtensionEdge;
    type = 'edge';
  } else if (name === 'opera') {
    screenshotURL = pinExtensionOpera;
    type = 'opera';
  } else if (name === 'brave') {
    screenshotURL = pinExtensionChrome;
    type = 'brave';
  }
}

export default {
  options: store(Options),
  render: {
    connect: () => {
      chrome.runtime.sendMessage({
        action: 'telemetry',
        event: 'install_complete',
      });
    },
    value: ({ options }) => html`
      <template layout="column gap:2 width:::500px">
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
              <ui-text type="display-s">You’re ready to block ads</ui-text>
              <div
                layout="block:left column gap padding:1:5 relative"
                layout@520px="block:center grid:3 padding:1:0"
              >
                <div
                  layout="hidden"
                  layout@520px="block absolute top:28px left:100px right:100px height:4px"
                  style="
                    border-top:3px dashed var(--background-primary);
                    background:
                      linear-gradient(var(--background-primary) 0 0) padding-box,
                      linear-gradient(to right, var(--background-brand-primary), var(--background-danger-primary), var(--background-success-primary));
                  "
                ></div>
                <div layout="row items:center gap" layout@520px="column">
                  <onboarding-step number="1" icon="websites" type="brand">
                  </onboarding-step>
                  <ui-text type="label-m">Open a site</ui-text>
                </div>
                <div layout="row items:center gap" layout@520px="column">
                  <onboarding-step number="2" icon="block-m" type="danger">
                  </onboarding-step>
                  ${lang === 'en'
                    ? html`<ui-text type="label-m" translate="no">
                        Zap ads once
                      </ui-text>`
                    : html`<ui-text type="label-m">Block ads once</ui-text>`}
                </div>
                <div layout="row items:center gap" layout@520px="column">
                  <onboarding-step number="3" icon="trust-m" type="success">
                  </onboarding-step>
                  <ui-text type="label-m">
                    Site stays ad-free every time you visit
                  </ui-text>
                </div>
              </div>
              <div layout="row center">
                <ui-lottie
                  src="${modeZapScreenshotUrl}"
                  autoplay
                  style="border-radius:8px"
                  layout="ratio:83/45 width:100%::400px overflow"
                ></ui-lottie>
              </div>
            `}
          </section>
        </ui-card>
        ${__PLATFORM__ !== 'firefox' &&
        screenshotURL &&
        html`
          <ui-card>
            <section layout="column center gap:3">
              <div
                layout="block:center column gap"
                layout@520px="padding:1:2:0"
              >
                <ui-text type="display-s">
                  Pin extension for easy access
                </ui-text>
                <ui-text layout="padding:0:2">
                  ${msg.html`Click the puzzle icon next to the search bar and <strong>pin Ghostery</strong> to your toolbar.`}
                </ui-text>
              </div>
              <img
                src="${screenshotURL}"
                layout="width:full::400px"
                style="border-radius:8px; overflow:hidden;"
              />
            </section>
          </ui-card>
          <onboarding-pin-it browser="${type}"> Pin it here </onboarding-pin-it>
        `}
      </template>
    `,
  },
};
