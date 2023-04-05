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

const NOTIFICATION_DELAY = 60 * 60 * 1000; // an hour in milliseconds

let shownAt = undefined;
observe('onboarding', (onboarding) => {
  shownAt = !onboarding.done && onboarding.shownAt;

  if (!onboarding.done && !onboarding.shownAt) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('/pages/onboarding/index.html'),
    });
  }
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (
    details.frameId === 0 &&
    shownAt &&
    Date.now() - shownAt > NOTIFICATION_DELAY
  ) {
    setTimeout(() => {
      const stats = tabStats.get(details.tabId);
      if (stats && stats.trackers.length) {
        sendShowIframeMessage(details.tabId, 'pages/onboarding/iframe.html');
      }
    }, 1000);
  }
});
