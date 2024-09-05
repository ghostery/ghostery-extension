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

import DailyStats from '/store/daily-stats';
import Options from '/store/options.js';

import { deleteDatabases } from '/utils/indexeddb.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case 'clearStorage':
      (async () => {
        try {
          console.info('[devtools] Clearing main local storage');
          chrome.storage.local.clear();

          console.info('[devtools] Removing all indexedDBs...');
          await deleteDatabases().catch((e) => {
            console.error('[devtools] Error removing indexedDBs:', e);
          });

          console.info('[devtools] Clearing store cache');
          try {
            store.clear(Options);
            store.clear(DailyStats);
          } catch (e) {
            console.error('[devtools] Error clearing store cache:', e);
          }

          await store.resolve(Options);

          sendResponse('Storage cleared');
        } catch (e) {
          sendResponse(`[devtools] Error clearing storage: ${e}`);
        }
      })();

      return true;
  }

  return false;
});
