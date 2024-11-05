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

import { getUserOptions, setUserOptions } from '/utils/api.js';
import { DEFAULT_REGIONS } from '/utils/regions.js';
import { isOpera } from '/utils/browser-info.js';
import * as OptionsObserver from '/utils/options-observer.js';

import CustomFilters from './custom-filters.js';
import Session from './session.js';

const UPDATE_OPTIONS_ACTION_NAME = 'updateOptions';
export const GLOBAL_PAUSE_ID = '<all_urls>';

export const SYNC_OPTIONS = [
  'blockAds',
  'blockTrackers',
  'blockAnnoyances',
  'regionalFilters',
  'customFilters',
  'experimentalFilters',
  'trackerWheel',
  'trackerCount',
  'wtmSerpReport',
  'serpTrackingPrevention',
  'panel',
];

export const ENGINES = [
  { name: 'ads', key: 'blockAds' },
  { name: 'tracking', key: 'blockTrackers' },
  { name: 'annoyances', key: 'blockAnnoyances' },
];

const OPTIONS_VERSION = 3;

const Options = {
  // Main features
  blockAds: true,
  blockTrackers: true,
  blockAnnoyances: true,

  // Regional filters
  regionalFilters: {
    enabled: DEFAULT_REGIONS.length > 0,
    regions: DEFAULT_REGIONS.length ? DEFAULT_REGIONS : [String],
  },

  // Advanced features
  customFilters: {
    enabled: false,
    trustedScriptlets: false,
  },
  experimentalFilters: false,

  filtersUpdatedAt: 0,

  // Browser toolbar icon
  trackerWheel: false,
  ...(__PLATFORM__ !== 'safari' ? { trackerCount: true } : {}),

  // SERP
  wtmSerpReport: true,
  serpTrackingPrevention: true,

  // Onboarding
  terms: false,
  onboarding: {
    shown: 0,
    ...(__PLATFORM__ === 'chromium' && isOpera()
      ? { serpShownAt: 0, serpShown: 0 }
      : {}),
  },
  installDate: '',

  // Panel
  panel: { statsType: 'graph' },

  // Pause
  paused: store.record({ revokeAt: 0 }),

  // Sync
  sync: true,
  revision: 0,

  // Managed
  managed: false,

  [store.connect]: {
    async get() {
      let { options, optionsVersion } = await chrome.storage.local.get([
        'options',
        'optionsVersion',
      ]);

      // Try to migrate options from v8 if options
      // are not set (the initial get) for supported platforms
      if (!options) {
        options = __PLATFORM__ !== 'safari' ? await migrateFromV8() : {};
      }

      // Set version to the latest one if it is not set
      // or trigger migration for older versions
      if (!optionsVersion) {
        chrome.storage.local.set({ optionsVersion: OPTIONS_VERSION });
      } else if (optionsVersion < OPTIONS_VERSION) {
        const keys = [];

        if (optionsVersion < 2) {
          // Migrate 'paused' array to record
          if (options.paused) {
            options.paused = options.paused.reduce((acc, { id, revokeAt }) => {
              acc[id] = { revokeAt };
              return acc;
            }, {});
          }
        }

        if (optionsVersion < 3) {
          // Check if the user has custom filters, so we need to
          // reflect the enabled state in the options
          const { text } = await store.resolve(CustomFilters);
          if (text) {
            options.customFilters = {
              ...options.customFilters,
              enabled: true,
            };
            keys.push('customFilters');
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

      return __PLATFORM__ === 'firefox' || __PLATFORM__ === 'chromium'
        ? applyManagedOptions(options)
        : options;
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
      chrome.runtime
        .sendMessage({
          action: UPDATE_OPTIONS_ACTION_NAME,
        })
        .catch(() => {
          // sendMessage may fail without potential target
        });

      sync(options, keys);

      return options;
    },
    observe: (_, options, prevOptions) => {
      OptionsObserver.execute(options, prevOptions);

      // Sync if the current memory context get options for the first time
      if (!prevOptions) sync(options);
    },
  },
};

export default Options;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === UPDATE_OPTIONS_ACTION_NAME) {
    store.clear(Options, false);
    store.get(Options);
  }
});

let managed = __PLATFORM__ === 'chromium' && isOpera() ? false : null;
async function applyManagedOptions(options) {
  if (managed === false) return options;

  if (managed === null) {
    try {
      managed = await chrome.storage.managed.get(null);
      // Some of the platforms returns an empty object if there are no managed options
      // so we need to check property existence that the managed options are enabled
      managed = Object.keys(managed).length > 0 ? managed : false;
    } catch (e) {
      console.error(`[options] Failed to get managed options`, e);
      managed = false;
    }
  }

  if (managed) {
    console.debug(`[options] Applying managed options...`, managed);

    if (managed.disableOnboarding === true) {
      options.terms = true;
      options.onboarding = { shown: 1 };
    }

    if (managed.disableUserControl === true) {
      options.managed = true;
      options.sync = false;

      // Clear out the paused state, to overwrite with the current managed state
      options.paused = {};
    }

    if (Array.isArray(managed.trustedDomains)) {
      managed.trustedDomains.forEach((domain) => {
        options.paused ||= {};
        options.paused[domain] = { revokeAt: 0 };
      });
    }
  }

  return options;
}

export function isPaused(options, domain = '') {
  return (
    !!options.paused[GLOBAL_PAUSE_ID] ||
    (domain && !!options.paused[domain.replace(/^www\./, '')])
  );
}

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
    console.error(`[options] Error while syncing options: `, e);
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
        shown: storage.setup_shown || 0,
      };

      options.terms = storage.setup_complete || false;

      options.wtmSerpReport = storage.enable_wtm_serp_report ?? true;

      options.paused = storage.site_whitelist.reduce((acc, domain) => {
        acc[domain] = { revokeAt: 0 };
        return acc;
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

      // Bring back metrics and UTMs
      await chrome.storage.local.set({
        metrics: storage.metrics,
        utms: {
          utm_campaign: storage.utm_campaign,
          utm_source: storage.utm_source,
        },
      });

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

      console.info(`[options] Successfully migrated options from v8`, options);
    }

    return options;
  } catch (e) {
    console.error(`[options] Error while migrating options`, e);
    return {};
  }
}
