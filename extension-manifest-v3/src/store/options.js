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
import { deleteDB } from 'idb';

import { session, getUserOptions, setUserOptions } from '/utils/api.js';

const UPDATE_OPTIONS_ACTION_NAME = 'updateOptions';

const observers = new Set();

export const SYNC_OPTIONS = [
  'blockAds',
  'blockTrackers',
  'blockAnnoyances',
  'trackerWheel',
  'trackerCount',
  'wtmSerpReport',
  'panel',
];

export const ENGINES = [
  {
    name: 'ads',
    option: 'blockAds',
  },
  {
    name: 'tracking',
    option: 'blockTrackers',
  },
  {
    name: 'annoyances',
    option: 'blockAnnoyances',
  },
];

const Options = {
  // Main features
  blockAds: true,
  blockTrackers: true,
  blockAnnoyances: true,

  // Never-consent popup
  autoconsent: {
    all: false,
    allowed: [String],
    disallowed: [String],
    interactions: 0,
  },

  // Browser icon
  trackerWheel: true,
  ...(__PLATFORM__ !== 'safari' ? { trackerCount: true } : {}),

  // Tracker wheel on SERP
  wtmSerpReport: true,

  // Onboarding
  terms: false,
  onboarding: { done: false, shownAt: 0, shown: 0 },
  installDate: '',

  // Panel
  panel: { statsType: 'graph' },

  // Pause
  paused: [{ id: true, revokeAt: 0 }],

  // Sync
  sync: true,
  revision: 0,

  [store.connect]: {
    async get() {
      let { options = {}, optionsVersion = 0 } = await chrome.storage.local.get(
        ['options', 'optionsVersion'],
      );

      // Migrate options
      if (optionsVersion < 1) {
        const keys = [];

        // Migrate from Extension v8 (MV2)
        if (__PLATFORM__ !== 'safari') {
          options = migrateFromMV2();
        }

        // The v10.1.0 introduced options rollback when DNR lists fail to update.
        // It looks, that a major part of the users were affected by this issue,
        // so they might have switched off main features not intentionally.
        // We need to switched them on again one time only for onboarded users.
        if (__PLATFORM__ === 'safari' && options.terms) {
          options.blockAds = true;
          options.blockTrackers = true;
          options.blockAnnoyances = true;

          keys.push('blockAds', 'blockTrackers', 'blockAnnoyances');
        }

        // Flush updated options and version to the storage
        await chrome.storage.local.set({
          options,
          optionsVersion: 1,
        });

        // Send updated options to the server
        Promise.resolve().then(() => sync(options, keys));
      }

      return options;
    },
    async set(_, options, keys) {
      options = options || {};

      await chrome.storage.local.set({
        options:
          // Firefox does not serialize correctly objects with getters
          __PLATFORM__ === 'firefox'
            ? JSON.parse(JSON.stringify(options))
            : options,
      });

      sync(options, keys)
        .then(() =>
          // Send update message to another contexts (background page / panel / options)
          chrome.runtime.sendMessage({
            action: UPDATE_OPTIONS_ACTION_NAME,
          }),
        )
        .catch(() => null);

      return options;
    },
    observe: (_, options, prevOptions) => {
      // Sync if the current memory context get options for the first time
      if (!prevOptions) sync(options);

      observers.forEach(async (fn) => {
        try {
          await fn(options, prevOptions);
        } catch (e) {
          console.error(`Error while observing options: `, e);
        }
      });
    },
  },
};

export default Options;

export async function sync(options, keys) {
  try {
    // Do not sync if revision is set or terms and sync options are false
    if (keys?.includes('revision') || !options.terms || !options.sync) {
      return;
    }

    // If user is not logged in, clean up options revision and return
    if (!(await session().catch(() => null))) {
      if (options.revision !== 0) {
        store.set(Options, { revision: 0 });
      }
      return;
    }

    // If options update, set revision to "dirty" state
    if (keys && options.revision > 0) {
      options = await store.set(Options, { revision: options.revision * -1 });
    }

    const serverOptions = await getUserOptions();

    // Server has newer options - merge with local options
    if (serverOptions.revision > Math.abs(options.revision)) {
      const values = SYNC_OPTIONS.reduce(
        (acc, key) => {
          if (!keys?.includes(key) && hasOwnProperty.call(serverOptions, key)) {
            acc[key] = serverOptions[key];
          }

          return acc;
        },
        { revision: serverOptions.revision },
      );

      options = await store.set(Options, values);
    }

    // Set options or update:
    // * No revision on server - initial sync
    // * Keys are passed - options update
    // * Revision is negative - local options are dirty (not synced)
    if (!serverOptions.revision || keys || options.revision < 0) {
      const { revision } = await setUserOptions(
        SYNC_OPTIONS.reduce(
          (acc, key) => {
            acc[key] = options[key];
            return acc;
          },
          { revision: serverOptions.revision + 1 },
        ),
      );

      // Update local revision
      await store.set(Options, { revision });
    }
  } catch (e) {
    console.error(`Error while syncing options: `, e);
  }
}

async function migrateFromMV2() {
  try {
    const options = {};
    const storage = await chrome.storage.local.get(null);

    // Proceed if the storage contains data from v2
    if ('version_history' in storage) {
      options.blockAds = storage.enable_ad_block || false;
      options.blockTrackers = storage.enable_anti_tracking || false;
      options.blockAnnoyances = storage.enable_autoconsent || false;

      options.onboarding = {
        done: storage.setup_complete || storage.setup_skip || false,
        shownAt: storage.setup_timestamp || 0,
        shown: storage.setup_shown || 0,
      };

      options.terms = storage.setup_complete || false;

      options.wtmSerpReport = storage.enable_wtm_serp_report || true;

      options.autoconsent = {
        all: !storage.autoconsent_whitelist,
        allowed: storage.autoconsent_whitelist || [],
        disallowed: storage.autoconsent_blacklist || [],
      };

      options.paused = storage.site_whitelist.map((domain) => ({
        id: domain,
        revokeAt: 0,
      }));

      options.installDate = storage.install_date || '';

      await chrome.storage.local.clear();

      // Delete indexedDBs
      // Notice: Doesn't wait to avoid blocking the migrated options
      [
        '__dbnames',
        'antitracking',
        'cliqz-adb',
        'cliqz-kv-store',
        'hpnv2',
      ].forEach((name) => deleteDB(name).catch(() => {}));

      // Set options by hand to make sure, that
      // paused side effects are triggered
      await Options[store.connect].set(undefined, options, [
        'engines',
        'onboarding',
        'terms',
        'wtmSerpReport',
        'autoconsent',
        'paused',
        'installDate',
      ]);
    }

    return options;
  } catch (e) {
    console.error(`Error while migrating data`, e);
    return {};
  }
}

export async function observe(property, fn) {
  let wrapper;
  if (property) {
    let value;
    wrapper = async (options) => {
      if (value === undefined || options[property] !== value) {
        const prevValue = value;
        value = options[property];
        return await fn(value, prevValue);
      }
    };
  } else {
    wrapper = fn;
  }

  try {
    const options = await store.resolve(Options);
    // let observer know of the option value
    // in case when registered after the store.connect
    // wait for the callback to be fired
    await wrapper(options);
  } catch (e) {
    console.error(`Error while observing options: `, e);
  }

  observers.add(wrapper);

  // Return unobserve function
  return () => {
    observers.delete(wrapper);
  };
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === UPDATE_OPTIONS_ACTION_NAME) {
    store.clear(Options, false);
    store.get(Options);
  }
});
