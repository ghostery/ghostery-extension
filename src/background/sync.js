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
import Session from '/store/session.js';

import { getUserOptions, setUserOptions } from '/utils/api.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { HOME_PAGE_URL, ACCOUNT_PAGE_URL } from '/utils/api.js';
import debounce from '/utils/debounce.js';

const syncOptions = debounce(
  async function (options, prevOptions) {
    try {
      // Skip if revision has changed
      if (prevOptions && options.revision !== prevOptions.revision) return;

      // Clean up if sync should be disabled
      if (
        !options.terms ||
        !options.sync ||
        !(await store.resolve(Session)).user
      ) {
        if (options.revision !== 0) {
          store.set(Options, { revision: 0 });
        }
        return;
      }

      const keys =
        prevOptions &&
        SYNC_OPTIONS.filter(
          (key) =>
            !OptionsObserver.isOptionEqual(options[key], prevOptions[key]),
        );

      // If options update, set revision to "dirty" state
      if (keys && options.revision > 0) {
        // Updated keys are not on the list of synced options
        if (keys.length === 0) return;

        options = await store.set(Options, { revision: options.revision * -1 });
      }

      const serverOptions = await getUserOptions();

      // Server has newer options - merge with local options
      // The try/catch block is used to prevent failure of updating local options
      // with server options with obsolete structure
      try {
        if (serverOptions.revision > Math.abs(options.revision)) {
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
      // * No revision on server - initial sync
      // * Keys are passed - options update
      // * Revision is negative - local options are dirty (not synced)
      if (!serverOptions.revision || keys?.length || options.revision < 0) {
        const { revision } = await setUserOptions(
          SYNC_OPTIONS.reduce(
            (acc, key) => {
              if (hasOwnProperty.call(options, key)) {
                acc[key] = options[key];
              }
              return acc;
            },
            { revision: serverOptions.revision + 1 },
          ),
        );

        // Update local revision
        await store.set(Options, { revision });
        console.info('[sync] Options synced with revision:', revision);
      }
    } catch (e) {
      console.error(`[sync] Error while syncing options: `, e);
    }
  },
  // Avoid syncing twice with fast toggling an option
  { waitFor: 200 },
);

// Sync options on startup and when options change
OptionsObserver.addListener(function sync(options, prevOptions) {
  syncOptions(options, prevOptions);
});

// Sync options when a user logs in/out directly
// from the ghostery.com page (not from the settings page)
chrome.webNavigation.onDOMContentLoaded.addListener(async ({ url = '' }) => {
  if (url === HOME_PAGE_URL || url.includes(ACCOUNT_PAGE_URL)) {
    store.resolve(Options).then((options) => syncOptions(options));
  }
});

// Sync options on demand - triggered by the options page and panel
// to force sync options when opened
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'syncOptions') {
    store.resolve(Options).then((options) => syncOptions(options));
  }
});
