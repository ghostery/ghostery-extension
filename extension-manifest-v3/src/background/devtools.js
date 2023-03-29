import { store } from 'hybrids';
import DailyStats from '/store/daily-stats';

import Options from '/store/options.js';
import { deleteDatabases } from '/utils/indexeddb.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'clearStorage') {
    (async () => {
      // Restore options to default values
      console.log('[devtools] Restoring options to default values');
      await store.set(Options, null);

      // Clear stats memory cache
      console.log('[devtools] Clearing stats memory cache');
      store.clear(DailyStats);

      // Clear main local storage
      console.log('[devtools] Clearing main local storage');
      chrome.storage.local.clear();

      // Remove all indexedDBs
      console.log('[devtools] Removing all indexedDBs...');
      await deleteDatabases();

      sendResponse();
    })();

    return true;
  }

  return false;
});
