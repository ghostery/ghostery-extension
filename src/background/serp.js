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

import trackersPreviewCSS from '/content_scripts/trackers-preview.css?raw';

import Options, { isGloballyPaused } from '/store/options.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { getWTMStats } from '/utils/wtm-stats.js';
import { parseWithCache } from '/utils/request.js';

// Trackers preview messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getWTMReport') {
    sendResponse({
      wtmStats: msg.links.map((url) => {
        const { domain } = parseWithCache(url);

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

export const SERP_URL_REGEXP =
  /^https?:[/][/][^/]*[.](google|bing)[.][a-z]+([.][a-z]+)?([/][a-z]+)*[/]search/;

// Trackers preview content script
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

      chrome.scripting.executeScript(
        {
          injectImmediately: true,
          world: chrome.scripting.ExecutionWorld?.ISOLATED ?? 'ISOLATED',
          target: {
            tabId: details.tabId,
          },
          files: ['/content_scripts/trackers-preview.js'],
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

const SERP_TRACKING_CONTENT_SCRIPT_ID = 'serp-tracking-prevention';

// A result page has to be covered from the moment it starts loading, wherever
// it loads - in a frame, or in a document the browser is prerendering, which
// no navigation is reported for until it is shown. Registering the script
// leaves that to the browser instead of racing it.
//
// Registering once wiped Safari's manifest-declared content scripts
// (FB12817504, the reason for the `executeScript` approach in #1278);
// verified fixed on Safari 18.6, the minimum supported version.
OptionsObserver.addListener(async function serpTrackingPrevention(options, lastOptions) {
  const enabled = options.serpTrackingPrevention && !isGloballyPaused(options);

  if (lastOptions) {
    const wasEnabled = lastOptions.serpTrackingPrevention && !isGloballyPaused(lastOptions);
    if (enabled === wasEnabled) return;
  }

  const registered = (
    await chrome.scripting.getRegisteredContentScripts({
      ids: [SERP_TRACKING_CONTENT_SCRIPT_ID],
    })
  ).length;

  if (registered) {
    await chrome.scripting.unregisterContentScripts({
      ids: [SERP_TRACKING_CONTENT_SCRIPT_ID],
    });
  }

  if (enabled) {
    await chrome.scripting.registerContentScripts([
      {
        id: SERP_TRACKING_CONTENT_SCRIPT_ID,
        js: ['/content_scripts/prevent-serp-tracking.js'],
        // Result pages are served from a domain per country, and a match
        // pattern cannot wildcard a top level domain. What they do share is
        // `/search` in the path; the domain itself is checked in the script.
        matches: ['*://*/search*', '*://*/*/search*'],
        allFrames: true,
        runAt: 'document_start',
        persistAcrossSessions: true,
      },
    ]);
  }
});
