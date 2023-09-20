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

import { observe } from '/store/options.js';
import { sendShowIframeMessage } from './utils/iframe.js';
import { tabStats } from './stats.js';
import { showOperaSerpNotification } from '/utils/opera-serp.js';

const NOTIFICATION_DELAY = 24 * 60 * 60 * 1000; // a day in milliseconds
const NOTIFICATION_TRACKERS_THRESHOLD = 10;

let done = false;
let shownAt = 0;

observe(null, (options) => {
  ({ done, shownAt } = options.onboarding);

  if (!done && !shownAt) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('/pages/onboarding/index.html'),
    });
  }
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    if (!done) {
      if (shownAt && Date.now() - shownAt > NOTIFICATION_DELAY) {
        setTimeout(() => {
          const stats = tabStats.get(details.tabId);
          if (
            stats &&
            stats.trackers.length >= NOTIFICATION_TRACKERS_THRESHOLD
          ) {
            sendShowIframeMessage(
              details.tabId,
              'pages/onboarding/iframe.html',
            );
          }
        }, 1000);
      }
    } else if (__PLATFORM__ === 'opera') {
      showOperaSerpNotification(() => {
        sendShowIframeMessage(details.tabId, 'pages/onboarding/serp.html');
      });
    }
  }
});
