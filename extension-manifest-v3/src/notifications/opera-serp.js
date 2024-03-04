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

import { store } from 'hybrids';

import Options from '/store/options.js';

import { setCookie } from '/utils/api.js';
import { sendShowIframeMessage } from '/utils/iframe.js';

const NOTIFICATION_SHOW_LIMIT = 4;
const NOTIFICATION_DELAY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const TEST_COOKIE_NAME = `ghostery:opera:cookie:test:${Date.now()}`;

async function isSerpSupported() {
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
    setCookie('opera_serp_notification', 'true', 60 * 60 * 24 * 365 * 10);

    return true;
  } catch (e) {
    // Clear out the cookie if it was set
    setCookie('opera_serp_notification', undefined);

    return false;
  }
}

export async function showOperaSerpNotification(tabId) {
  try {
    if (await isSerpSupported()) return;

    const { onboarding } = await store.resolve(Options);

    if (
      // Onboarding is not "done"
      !onboarding.done ||
      // The notification was already shown maximum times
      onboarding.serpShown >= NOTIFICATION_SHOW_LIMIT ||
      // The notification was already shown recently
      (onboarding.serpShownAt &&
        Date.now() - onboarding.serpShownAt < NOTIFICATION_DELAY)
    ) {
      return false;
    }

    sendShowIframeMessage(tabId, 'pages/onboarding/opera-serp.html');
  } catch (e) {
    console.error('Error while showing Opera SERP notification', e);
  }
}

export async function shouldShowOperaSerpAlert() {
  const options = await store.resolve(Options);
  if (options.onboarding.serpShown < NOTIFICATION_SHOW_LIMIT) {
    if (await isSerpSupported()) {
      store.set(options, {
        onboarding: { serpShown: NOTIFICATION_SHOW_LIMIT },
      });
      return false;
    }

    return true;
  }

  return false;
}

export async function shouldSetDangerBadgeForTabId(tabId) {
  const options = await store.resolve(Options);

  if (options.onboarding.serpShown < NOTIFICATION_SHOW_LIMIT) {
    try {
      await chrome.scripting.insertCSS({
        target: { tabId },
        css: '',
      });

      return false;
    } catch (e) {
      return true;
    }
  }
}
