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

import Options, { observe } from '/store/options.js';

import { isSerpSupported } from '/utils/opera.js';
import { isOpera } from '/utils/browser-info.js';

import { openNotification } from './notifications.js';

let done = false;

observe('onboarding', (onboarding) => {
  done = onboarding.done;

  if (!done && !onboarding.shownAt) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('/pages/onboarding/index.html'),
    });
  }
});

if (__PLATFORM__ === 'chromium' && isOpera()) {
  const NOTIFICATION_DELAY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const NOTIFICATION_SHOW_LIMIT = 4;

  chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (done && details.frameId === 0) {
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

      openNotification(details.tabId, 'opera-serp');
    }
  });
}
