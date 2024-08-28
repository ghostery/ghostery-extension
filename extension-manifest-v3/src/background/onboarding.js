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
import { showOperaSerpNotification } from '/notifications/opera-serp.js';

let done = false;
let shownAt = 0;

observe((options) => {
  ({ done, shownAt } = options.onboarding);

  if (!done && !shownAt) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('/pages/onboarding/index.html'),
    });
  }
});

if (__PLATFORM__ === 'opera') {
  chrome.webNavigation.onCompleted.addListener((details) => {
    if (done && details.frameId === 0) {
      showOperaSerpNotification(details.tabId);
    }
  });
}
