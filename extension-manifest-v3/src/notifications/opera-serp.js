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

    return true;
  } catch (e) {
    return false;
  }
}

export async function shouldShowOperaSerpNotification(cb) {
  try {
    if (await isSerpSupported()) return false;

    const { autoconsent, onboarding } = await store.resolve(Options);

    if (
      // Onboarding is not "done"
      !onboarding.done ||
      // Autoconsent setup not complete
      (!autoconsent.all && autoconsent.allowed.length === 0) ||
      // The notification was already shown maximum times
      onboarding.serpShown >= NOTIFICATION_SHOW_LIMIT ||
      // The notification was already shown recently
      (onboarding.serpShownAt &&
        Date.now() - onboarding.serpShownAt < NOTIFICATION_DELAY)
    ) {
      return false;
    }

    // Run the callback function
    if (cb) cb();

    return true;
  } catch (e) {
    return false;
  }
}

export async function shouldShowOperaSerpAlert() {
  if (await isSerpSupported()) return false;

  const options = await store.resolve(Options);
  return options.onboarding.serpShown < NOTIFICATION_SHOW_LIMIT;
}
