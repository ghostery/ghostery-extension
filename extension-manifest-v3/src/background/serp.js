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

import Options, { isPaused } from '/store/options.js';
import trackersPreviewCSS from '/content_scripts/trackers-preview.css?raw';
import { getWTMStats } from '/utils/wtm-stats';

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
