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

import Session from '/store/session.js';

if (__PLATFORM__ === 'chromium' || __PLATFORM__ === 'firefox') {
  // Listen for messages from Ghostery Search extension
  // https://github.com/ghostery/ghostery-search-extension/blob/main/src/background.js#L40

  const GHOSTERY_SEARCH_EXTENSION_IDS = [
    'nomidcdbhopffbhbpfnnlgnfimhgdman', // Chrome
    'search@ghostery.com', // Firefox
  ];

  chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
      // Refresh session support for Ghostery Search extension
      if (GHOSTERY_SEARCH_EXTENSION_IDS.includes(sender.id)) {
        switch (message) {
          case 'refreshToken':
            store
              .resolve(Session)
              .then(({ user }) => sendResponse({ success: !!user }));
            return true;
          default:
            console.error(
              `[external] Unknown message type from "${sender.id}"`,
              message,
            );
        }
      }

      return false;
    },
  );
}
