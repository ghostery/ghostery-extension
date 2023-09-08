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
import {
  tryWTMReportOnMessageHandler,
  isDisableWTMReportMessage,
} from '@ghostery/trackers-preview/background';
import css from '@ghostery/trackers-preview/content_scripts/styles.css?raw';

import Options from '/store/options.js';

const SERP_URL_REGEXP = /google\.[a-z]+(\.[a-z]+)?\/search/;

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.url.match(SERP_URL_REGEXP)) {
    store.resolve(Options).then((options) => {
      if (options.wtmSerpReport) {
        chrome.scripting.insertCSS({
          target: {
            tabId: details.tabId,
          },
          css,
        });
      }

      if (options.wtmSerpReport || options.serpTracking) {
        chrome.scripting.executeScript(
          {
            injectImmediately: true,
            world: 'ISOLATED',
            target: {
              tabId: details.tabId,
            },
            files: [
              ...(options.wtmSerpReport
                ? ['/content_scripts/trackers-preview.js']
                : null),
              ...(options.serpTracking
                ? ['/content_scripts/prevent-serp-tracking.js']
                : null),
            ],
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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const options = store.get(Options);

  if (!store.ready(options)) {
    return false;
  }

  if (options.wtmSerpReport) {
    if (tryWTMReportOnMessageHandler(msg, sender, sendResponse)) {
      return false;
    }

    if (isDisableWTMReportMessage(msg)) {
      store.set(options, { wtmSerpReport: false });
    }
  }

  return false;
});
