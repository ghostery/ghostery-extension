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

import { GHOSTERY_DOMAIN } from '/utils/urls.js';

const TEST_COOKIE_NAME = `ghostery:opera:cookie:test:${Date.now()}`;
export const COOKIE_DOMAIN = `.${GHOSTERY_DOMAIN}`;
const COOKIE_URL = `https://${GHOSTERY_DOMAIN}`;

let isSupported = undefined;
export async function isSerpSupported() {
  if (isSupported === undefined) {
    try {
      await chrome.cookies.set({
        url: 'https://www.google.com/',
        name: TEST_COOKIE_NAME,
        value: '',
        domain: '.google.com',
        path: '/',
        secure: true,
        httpOnly: true,
      });

      chrome.cookies.remove({
        url: 'https://www.google.com/',
        name: TEST_COOKIE_NAME,
      });

      // Set `opera_serp_notification` on the `ghostery.com` domain
      // to make sure the top bar notification is not shown
      chrome.cookies.set({
        name: 'opera_serp_notification',
        url: COOKIE_URL,
        path: '/',
        value: 'true',
        domain: COOKIE_DOMAIN,
        expirationDate: Date.now() / 1000 + 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
      });

      isSupported = true;
    } catch {
      isSupported = false;
    }
  }

  return isSupported;
}
