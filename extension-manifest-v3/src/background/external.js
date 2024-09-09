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
import { MergedStats } from '/store/daily-stats.js';

if (__PLATFORM__ === 'chromium' || __PLATFORM__ === 'firefox') {
  // Listen for messages from Ghostery Search extension
  // https://github.com/ghostery/ghostery-search-extension/blob/main/src/background.js#L40

  const GHOSTERY_SEARCH_EXTENSION_IDS = [
    'nomidcdbhopffbhbpfnnlgnfimhgdman', // Chrome
    'search@ghostery.com', // Firefox
  ];

  const GHOSTERY_NEW_TAB_EXTENSION_IDS = ['newtab@ghostery.com'];

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

      // Send historical stats to Ghostery New Tab extension
      if (GHOSTERY_NEW_TAB_EXTENSION_IDS.includes(sender.id)) {
        switch (message?.name) {
          case 'getDashboardStats': {
            (async () => {
              const stats = await store.resolve(MergedStats);

              // Firefox does not serialize correctly objects with getters
              sendResponse(JSON.parse(JSON.stringify(stats)));
            })();

            return true;
          }
          case 'getUser': {
            (async () => {
              const session = await store.resolve(Session);

              // Firefox does not serialize correctly objects with getters
              sendResponse(session.user && JSON.parse(JSON.stringify(session)));
            })();

            return true;
          }
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
