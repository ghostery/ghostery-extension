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

import Options, { isGloballyPaused } from '/store/options.js';

import { isSerpSupported } from '/utils/opera.js';
import { getWTMStats } from '/utils/wtm-stats.js';
import { isOpera } from '/utils/browser-info.js';

import { openNotification } from './notifications.js';

// Opera SERP notification
if (__PLATFORM__ !== 'firefox' && isOpera()) {
  const NOTIFICATION_DELAY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const NOTIFICATION_SHOW_LIMIT = 4;

  chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (details.frameId !== 0 || (await isSerpSupported())) return;

    openNotification({
      id: 'opera-serp',
      tabId: details.tabId,
      shownLimit: NOTIFICATION_SHOW_LIMIT,
      delay: NOTIFICATION_DELAY,
      position: 'center',
    });
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
  /^https?:[/][/][^/]*[.](google|bing)[.][a-z]+([.][a-z]+)?([/][a-z]+)*[/]search/;

// SERP tracking prevention and trackers preview content scripts
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.url.match(SERP_URL_REGEXP)) {
    const options = await store.resolve(Options);

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

      if (options.wtmSerpReport) {
        files.push('/content_scripts/trackers-preview.js');
      }

      if (!isGloballyPaused(options) && options.serpTrackingPrevention) {
        files.push('/content_scripts/prevent-serp-tracking.js');
      }

      if (files.length === 0) return;

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
  }
});
