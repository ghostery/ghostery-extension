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

import * as observer from '/utils/observer.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case 'getCurrentTab':
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        if (tab.url !== sender.url) {
          sendResponse(tab);
        } else {
          chrome.tabs
            .query({ active: true, currentWindow: false })
            .then(([otherTab]) => {
              sendResponse(otherTab || tab);
            });
        }
      });

      return true;
    case 'openTabWithUrl':
      chrome.tabs.create({ url: msg.url });
      break;
    case 'openPrivateWindowWithUrl':
      chrome.windows.create({ url: msg.url, incognito: true });
      break;
    // This is used only by the e2e tests to detect idle state
    case 'idleOptionsObservers': {
      observer.waitForIdle().then(() => {
        sendResponse('done');
        console.info('[helpers] "idleOptionsObservers" response...');
      });

      return true;
    }
  }

  return false;
});
