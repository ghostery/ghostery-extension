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

import * as engines from '../utils/engines.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case 'clearStorage':
      (async () => {
        try {
          // Restore options to default values
          console.log('[devtools] Restoring options to default values');
          await store.set(Options, null);

          // Clear stats memory cache
          console.log('[devtools] Clearing stats memory cache');
          try {
            store.clear(DailyStats);
          } catch (e) {
            console.log('[devtools] Stats memory cache is empty');
          }

          // Clear main local storage
          console.log('[devtools] Clearing main local storage');
          chrome.storage.local.clear();

          // Remove all indexedDBs
          console.log('[devtools] Removing all indexedDBs...');
          await deleteDatabases();

          sendResponse('Storage cleared');
        } catch (e) {
          sendResponse(`Error clearing storage: ${e}`);
        }
      })();

      return true;

    case 'updateEngines':
      (async () => {
        try {
          await engines.updateAll();
          sendResponse(`Engines updated`);
        } catch (e) {
          sendResponse(`Error updating engines: ${e}`);
        }
      })();

      return true;
  }

  return false;
});
