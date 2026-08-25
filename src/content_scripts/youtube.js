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

const WALL_SELECTORS = [
  // Based on https://github.com/AdguardTeam/AdguardFilters/blob/e5ae8e3194f8d18bdcc660d4c42282e4a96ca5b9/AnnoyancesFilter/Popups/sections/antiadblock.txt#L2044
  'ytd-watch-flexy:not([hidden]) ytd-enforcement-message-view-model > div.ytd-enforcement-message-view-model',

  'yt-playability-error-supported-renderers#error-screen ytd-enforcement-message-view-model',
  'tp-yt-paper-dialog .ytd-enforcement-message-view-model',
];

const AD_SELECTORS = ['.html5-video-player.ad-showing'];

// DEBUG: Add the app selector to test the wall
if (__DEBUG__) WALL_SELECTORS.push('ytd-app');

function detectWall(cb) {
  let timeout = null;

  const observer = new MutationObserver(() => {
    if (timeout) return;

    timeout = setTimeout(() => {
      if (document.querySelector(WALL_SELECTORS)?.clientHeight > 0) {
        try {
          cb();
        } catch {
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

function detectAd(cb) {
  let adShowing = false;

  const check = () => {
    const showing = !!document.querySelector(AD_SELECTORS);

    if (showing !== adShowing) {
      adShowing = showing;

      // Call the callback with 1 second delay to avoid glitch with YouTube UI being created
      if (showing) setTimeout(cb, 1000);
    }
  };

  const observer = new MutationObserver(check);

  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ['class'],
    });

    check();
  });
}

if (!chrome.extension.inIncognitoContext) {
  if (__CHROMIUM__) {
    detectAd(() => {
      chrome.runtime.sendMessage({ action: 'youtube:ads' });
    });
  }

  detectWall(() => {
    chrome.runtime.sendMessage({ action: 'youtube:wall' });

    window.addEventListener(
      'yt-navigate-start',
      () => {
        chrome.runtime.sendMessage({ action: 'youtube:navigate' });
      },
      { once: true, capture: true },
    );
  });
}
