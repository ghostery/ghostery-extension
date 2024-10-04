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

import { html } from 'hybrids';

import { getBrowserId } from '/utils/browser-info.js';

import protection from '../illustrations/protection.js';

import pinExtensionChrome from '../assets/pin-extension-chrome.jpg';
import pinExtensionEdge from '../assets/pin-extension-edge.jpg';
import pinExtensionOpera from '../assets/pin-extension-opera.jpg';

const PIN_EXTENSION_IMAGES = {
  chrome: pinExtensionChrome,
  edge: pinExtensionEdge,
  opera: pinExtensionOpera,
};

export default {
  platform: getBrowserId,
  pinIt: true,
  render: ({ platform, pinIt }) => html`
    <template layout="column gap">
      <ui-card data-qa="view:success">
        <section layout="block:center column gap:2">
          <div layout="row center">${protection}</div>
          <ui-text type="display-s">Setup Successful</ui-text>
          <ui-text>
            Ghostery is all set to stop trackers in their tracks and protect
            your privacy while browsing!
          </ui-text>
        </section>
      </ui-card>
      ${pinIt &&
      PIN_EXTENSION_IMAGES[platform] &&
      html`
        <ui-card>
          <section layout="column gap:2">
            <ui-text type="display-xs" layout="block:center">
              What’s next?
            </ui-text>
            <img
              src="${PIN_EXTENSION_IMAGES[platform]}"
              layout="width:::full"
              style="border-radius:8px; overflow:hidden;"
            />
            <div layout="row items:center gap">
              <ui-icon
                name="extension-${platform}"
                layout="block inline size:3"
                color="gray-400"
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
        ${pinIt &&
        html`
          <onboarding-pin-it platform="${platform}">
            Pin it here
          </onboarding-pin-it>
        `}
      `}
    </template>
  `,
};
