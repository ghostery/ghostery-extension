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

import * as notifications from '/utils/notifications.js';

const SELECTORS = [
  // Based on https://github.com/AdguardTeam/AdguardFilters/blob/e5ae8e3194f8d18bdcc660d4c42282e4a96ca5b9/AnnoyancesFilter/Popups/sections/antiadblock.txt#L2044
  'ytd-watch-flexy:not([hidden]) ytd-enforcement-message-view-model > div.ytd-enforcement-message-view-model',

  'yt-playability-error-supported-renderers#error-screen ytd-enforcement-message-view-model',
  'tp-yt-paper-dialog .ytd-enforcement-message-view-model',
];

function detectWall(cb) {
  let timeout = null;

  const observer = new MutationObserver(() => {
    if (timeout) return;

    timeout = setTimeout(() => {
      if (document.querySelector(SELECTORS)?.clientHeight > 0) {
        try {
          cb();
        } catch (e) {
          /* ignore */
        }
      } else {
        timeout = null;
      }
    }, 1000 /* 1 second delay */);
  });

  document.addEventListener('yt-navigate-start', () => {
    clearTimeout(timeout);
    timeout = null;
  });

  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ['src', 'style'],
    });
  });
}

async function isFeatureDisabled() {
  const { options, youtubeDontAsk } = await chrome.storage.local.get([
    'options',
    'youtubeDontAsk',
  ]);

  if (
    // User's choice to not show the wall
    youtubeDontAsk ||
    // Terms not accepted or paused
    !options ||
    !options.terms ||
    // IMPORTANT: to avoid referencing the file, the `GLOBAL_PAUSE_ID`
    // is used as is, instead from the `/store/options.js` file
    !!options.paused['<all_urls>'] ||
    !!options.paused['youtube.com']
  ) {
    return true;
  }

  return false;
}

// INFO: Safari always returns false for `inIncognitoContext`
if (!chrome.extension.inIncognitoContext) {
  (async () => {
    if (await isFeatureDisabled()) return;

    detectWall(async () => {
      if (await isFeatureDisabled()) return;
      chrome.runtime.sendMessage({
        action: notifications.OPEN_ACTION,
        id: 'youtube',
        params: { url: window.location.href },
      });
    });

    window.addEventListener(
      'yt-navigate-start',
      () => {
        chrome.runtime.sendMessage({ action: notifications.CLOSE_ACTION });
      },
      true,
    );
  })();
}
