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

import * as OptionsObserver from '/utils/options-observer.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case 'openTabWithUrl':
      chrome.tabs.create({ url: msg.url });
      break;
    case 'openPrivateWindowWithUrl':
      chrome.windows.create({ url: msg.url, incognito: true });
      break;
    // This is used only by the e2e tests to detect idle state
    case 'idleOptionsObservers': {
      OptionsObserver.waitForIdle().then(() => {
        sendResponse('done');
        console.info('[helpers] "idleOptionsObservers" response...');
      });

      return true;
    }
  }

  return false;
});
