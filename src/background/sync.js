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

async function sync(options, prevOptions) {
  if (sync.pending) {
    console.warn('[sync] Sync already in progress...');
    return;
  }

  try {
    sync.pending = true;

    // Do not sync if revision is set or terms and sync options are false
    if (!options.terms || !options.sync) {
      return;
    }

    const { user } = await store.resolve(Session);

    // If user is not logged in, clean up options revision and return
    if (!user) {
      if (options.revision !== 0) {
        store.set(Options, { revision: 0 });
      }
      return;
    }

    const keys =
      prevOptions &&
      SYNC_OPTIONS.filter(
        (key) => !OptionsObserver.isOptionEqual(options[key], prevOptions[key]),
      );

    // If options update, set revision to "dirty" state
    if (keys && options.revision > 0) {
      // Updated keys are not synchronized
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
    if (!serverOptions.revision || keys || options.revision < 0) {
      console.info('[sync] Syncing options with updated keys:', keys);
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
  } finally {
    sync.pending = false;
  }
}

// Sync options on startup and when options change
OptionsObserver.addListener(function syncOptions(options, prevOptions) {
  // Sync options on startup
  if (!prevOptions) {
    sync(options);
  }

  // Sync options when options change (skip on revision change)
  else if (options.revision === prevOptions.revision) {
    sync(options, prevOptions);
  }
});

// Sync options when a user logs in/out directly
// from the ghostery.com page (not from the settings page)
chrome.webNavigation.onDOMContentLoaded.addListener(async ({ url = '' }) => {
  if (url === HOME_PAGE_URL || url.includes(ACCOUNT_PAGE_URL)) {
    store.resolve(Options).then((options) => sync(options));
  }
});

// Sync options on demand - triggered by the options page and panel
// to force sync options when opened
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'syncOptions') {
    store.resolve(Options).then((options) => sync(options));
  }
});
