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

import Options, { SYNC_OPTIONS } from '/store/options.js';

import { isOpera, isSafari } from '/utils/browser-info.js';
import debounce from '/utils/debounce.js';
import * as OptionsObserver from '/utils/options-observer.js';

const syncOptions = debounce(
  async function (options, lastOptions) {
    try {
      // Return if sync is disabled
      if (!options.terms || !options.sync) {
        return;
      }

      // Skip if revision has changed
      if (lastOptions && options.revision !== lastOptions.revision) return;

      const keys =
        lastOptions &&
        SYNC_OPTIONS.filter(
          (key) =>
            !OptionsObserver.isOptionEqual(options[key], lastOptions[key]),
        );

      const { options: serverOptions = {} } = await chrome.storage.sync.get([
        'options',
      ]);

      // Server has newer options - merge with local options
      // The try/catch block is used to prevent failure of updating local options
      // with server options with obsolete structure
      try {
        if (serverOptions.revision > options.revision) {
          console.info(
            '[sync] Merging server options with revision:',
            serverOptions.revision,
          );
          const values = SYNC_OPTIONS.reduce(
            (acc, key) => {
              if (
                !keys?.includes(key) &&
                hasOwnProperty.call(serverOptions, key)
              ) {
                acc[key] = serverOptions[key];
              }

              return acc;
            },
            { revision: serverOptions.revision },
          );

          options = await store.set(Options, values);
        }
      } catch (e) {
        console.error(`[sync] Error while merging server options: `, e);
      }

      // Set options or update:
      // * Keys are passed - options update
      // * No revision on server - initial sync
      if (keys?.length || !serverOptions.revision) {
        // Update local revision
        options = await store.set(Options, { revision: options.revision + 1 });

        // Update sync options
        await chrome.storage.sync.set({
          options: SYNC_OPTIONS.reduce(
            (acc, key) => {
              acc[key] = options[key];
              return acc;
            },
            { revision: options.revision },
          ),
        });

        console.info('[sync] Options synced with revision:', options.revision);
      }
    } catch (e) {
      console.error(`[sync] Error while syncing options: `, e);
    }
  },
  // Avoid syncing twice with fast toggling an option
  { waitFor: 200 },
);

// Opera provides chrome.storage.sync API, but it does not sync data between browsers
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync#browser_compatibility
if (!isOpera() && !isSafari()) {
  // Sync options on startup and when options change
  OptionsObserver.addListener(function sync(options, lastOptions) {
    syncOptions(options, lastOptions);
  });

  // Sync options when sync storage changes
  chrome.storage.sync.onChanged.addListener((changes) => {
    if (changes.options) {
      store.resolve(Options).then((options) => {
        // Sync only if revision from sync is greater - the server updated sync.
        if (changes.options.newValue?.revision > options.revision) {
          console.log('[sync] Options changed:', changes.options);
          syncOptions(options);
        }
      });
    }
  });

  // Sync options on demand - triggered by the options page and panel
  // to force sync options when opened
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'syncOptions') {
      store.resolve(Options).then((options) => syncOptions(options));
    }
  });
}
