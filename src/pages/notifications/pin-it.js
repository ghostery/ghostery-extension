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

import { mount, html, store } from 'hybrids';
import '/ui/index.js';

import Options from '/store/options.js';

import * as notifications from '/utils/notifications.js';
import { HOME_PAGE_URL } from '/utils/urls.js';
import { getBrowser } from '/utils/browser-info.js';

import pinExtensionChromeUrl from './assets/pin-extension-chrome.png';
import pinExtensionEdgeUrl from './assets/pin-extension-edge.png';
import pinExtensionOperaUrl from './assets/pin-extension-opera.png';

let imageUrl = '';
let pathname = '';

switch (getBrowser().name) {
  case 'opera':
    imageUrl = pinExtensionOperaUrl;
    pathname = `/ghostery-ad-blocker-opera#how-do-i-pin-ghostery-to-the-opera-toolbar`;
    break;
  case 'edge':
    imageUrl = pinExtensionEdgeUrl;
    pathname = `/ghostery-ad-blocker-edge#how-do-i-pin-ghostery-to-the-microsoft-edge-toolbar`;
    break;
  default:
    imageUrl = pinExtensionChromeUrl;
    pathname = `/ghostery-ad-blocker-chrome#how-do-i-pin-the-ghostery-extension-to-the-chrome-toolbar`;
}

const closeDialog = notifications.setupNotificationPage(390);

async function close() {
  const options = await store.resolve(Options);

  await store.set(options, {
    onboarding: {
      pinIt: options.onboarding.pinIt + 1,
      pinItAt: Date.now(),
    },
  });

  closeDialog();
}

mount(document.body, {
  render: () => html`
    <template layout="block overflow">
      <ui-notification-dialog onclose="${close}">
        <span slot="title">Pin Ghostery – Take back control</span>
        <img src="${imageUrl}" alt="What's New" style="border-radius:8px" />
        <ui-text layout="block:center" color="secondary">
          See every tracker Ghostery stops in real time.
        </ui-text>
        <ui-button type="wtm" layout="self:center">
          <a
            href="${HOME_PAGE_URL + pathname}"
            target="_blank"
            onclick="${close}"
          >
            Need more help?
          </a>
        </ui-button>
      </ui-notification-dialog>
    </template>
  `,
});
