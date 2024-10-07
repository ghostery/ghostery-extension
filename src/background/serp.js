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
import { parse } from 'tldts-experimental';

import trackersPreviewCSS from '/content_scripts/trackers-preview.css?raw';

import Options, { isPaused } from '/store/options.js';

import { isSerpSupported } from '/utils/opera.js';
import { getWTMStats } from '/utils/wtm-stats.js';
import { isOpera } from '/utils/browser-info.js';

import { openNotification } from './notifications.js';

// Opera SERP notification
if (__PLATFORM__ === 'chromium' && isOpera()) {
  const NOTIFICATION_DELAY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const NOTIFICATION_SHOW_LIMIT = 4;

  chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (details.frameId !== 0 || (await isSerpSupported())) return;

    const { onboarding, terms } = await store.resolve(Options);

    if (
      // Terms not accepted
      !terms ||
      // The notification was already shown maximum times
      onboarding.serpShown >= NOTIFICATION_SHOW_LIMIT ||
      // The notification was already shown recently
      (onboarding.serpShownAt &&
        Date.now() - onboarding.serpShownAt < NOTIFICATION_DELAY)
    ) {
      return false;
    }

    openNotification(details.tabId, 'opera-serp');
  });
}

// Trackers preview messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getWTMReport') {
    sendResponse({
      wtmStats: msg.links.map((url) => {
        const { domain } = parse(url);

        return {
          stats: getWTMStats(domain),
          domain,
        };
      }),
    });
  }

  if (msg.action === 'disableWTMReport') {
    store.set(Options, { wtmSerpReport: false });
  }

  return false;
});

const SERP_URL_REGEXP =
  /^https:[/][/][^/]*[.]google[.][a-z]+([.][a-z]+)?[/]search/;

// SERP tracking prevention and trackers preview content scripts
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.url.match(SERP_URL_REGEXP)) {
    store.resolve(Options).then((options) => {
      if (options.wtmSerpReport) {
        chrome.scripting.insertCSS({
          target: {
            tabId: details.tabId,
          },
          css: trackersPreviewCSS,
        });
      }

      if (options.wtmSerpReport || options.serpTrackingPrevention) {
        const files = [];

        if (options.wtmSerpReport)
          files.push('/content_scripts/trackers-preview.js');
        if (!isPaused(options) && options.serpTrackingPrevention)
          files.push('/content_scripts/prevent-serp-tracking.js');

        chrome.scripting.executeScript(
          {
            injectImmediately: true,
            world: chrome.scripting.ExecutionWorld?.ISOLATED ?? 'ISOLATED',
            target: {
              tabId: details.tabId,
            },
            files,
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            }
          },
        );
      }
    });
  }
});
