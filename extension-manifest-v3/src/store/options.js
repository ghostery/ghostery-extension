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

import { getUserOptions, setUserOptions } from '../utils/api.js';

import Session from './session.js';

const UPDATE_OPTIONS_ACTION_NAME = 'updateOptions';
export const GLOBAL_PAUSE_ID = '<all_urls>';

const observers = new Set();

export const SYNC_OPTIONS = [
  'blockAds',
  'blockTrackers',
  'blockAnnoyances',
  'trackerWheel',
  'trackerCount',
  'wtmSerpReport',
  'serpTrackingPrevention',
  'experimentalFilters',
  'panel',
];

export const ENGINES = [
  { name: 'ads', key: 'blockAds' },
  { name: 'tracking', key: 'blockTrackers' },
  { name: 'annoyances', key: 'blockAnnoyances' },
];

const OPTIONS_VERSION = 2;

const Options = {
  // Main features
  blockAds: true,
  blockTrackers: true,
  blockAnnoyances: true,

  // Browser icon
  trackerWheel: __PLATFORM__ === 'safari',
  ...(__PLATFORM__ !== 'safari' ? { trackerCount: true } : {}),

  // SERP
  wtmSerpReport: true,
  serpTrackingPrevention: true,

  // Optional
  experimentalFilters: false,

  // Onboarding
  terms: false,
  onboarding: {
    done: false,
    shownAt: 0,
    shown: 0,
    ...(__PLATFORM__ === 'opera' ? { serpShownAt: 0, serpShown: 0 } : {}),
  },
  installDate: '',

  // Panel
  panel: { statsType: 'graph' },

  // Pause
  paused: store.record({ revokeAt: 0 }),

  // Sync
  sync: true,
  revision: 0,

  [store.connect]: {
    async get() {
      let { options = {}, optionsVersion = 0 } = await chrome.storage.local.get(
        ['options', 'optionsVersion'],
      );

      // Migrate options
      if (optionsVersion < OPTIONS_VERSION) {
        const keys = [];

        if (optionsVersion < 1) {
          // Migrate from Extension v8
          if (__PLATFORM__ !== 'safari') {
            options = await migrateFromV8();
          }
        }

        if (optionsVersion < 2) {
          // Migrate 'paused' array to record
          if (options.paused) {
            options.paused = options.paused.reduce((acc, { id, revokeAt }) => {
              acc[id] = { revokeAt };
              return acc;
            }, {});
          }
        }

        // Flush updated options and version to the storage
        await chrome.storage.local.set({
          options,
          optionsVersion: OPTIONS_VERSION,
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

      // Send update message to another contexts (background page / panel / options)
      chrome.runtime.sendMessage({
        action: UPDATE_OPTIONS_ACTION_NAME,
      });

      sync(options, keys).catch(() => null);

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

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === UPDATE_OPTIONS_ACTION_NAME) {
    store.clear(Options, false);
    store.get(Options);
  }
});

export default Options;

export async function sync(options, keys) {
  try {
    // Do not sync if revision is set or terms and sync options are false
    if (keys?.includes('revision') || !options.terms || !options.sync) {
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
    }
  } catch (e) {
    console.error(`Error while syncing options: `, e);
  }
}

async function migrateFromV8() {
  try {
    const options = {};
    const storage = await chrome.storage.local.get(null);

    // Proceed if the storage contains data from v2
    if ('version_history' in storage) {
      options.blockAds = storage.enable_ad_block ?? true;
      options.blockTrackers = storage.enable_anti_tracking ?? true;
      options.blockAnnoyances = storage.enable_autoconsent ?? true;

      options.onboarding = {
        done: storage.setup_complete || storage.setup_skip || false,
        shownAt: storage.setup_timestamp || 0,
        shown: storage.setup_shown || 0,
      };

      options.terms = storage.setup_complete || false;

      options.wtmSerpReport = storage.enable_wtm_serp_report ?? true;

      options.paused = storage.site_whitelist.reduce((acc, domain) => {
        acc[domain] = { revokeAt: 0 };
      }, {});

      options.installDate = storage.install_date || '';

      // Clear the storage
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

export async function observe(...args) {
  let wrapper;

  if (args.length === 2) {
    const [property, fn] = args;
    let value;
    wrapper = async (options) => {
      if (value === undefined || options[property] !== value) {
        const prevValue = value;
        value = options[property];
        return await fn(value, prevValue);
      }
    };
  } else {
    wrapper = args[0];
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

export function isPaused(options, domain = '') {
  return (
    !!options.paused[GLOBAL_PAUSE_ID] ||
    (domain && !!options.paused[domain.replace(/^www\./, '')])
  );
}
