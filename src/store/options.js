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

import { DEFAULT_REGIONS } from '/utils/regions.js';
import { isOpera } from '/utils/browser-info.js';
import * as OptionsObserver from '/utils/options-observer.js';

import CustomFilters from './custom-filters.js';

export const UPDATE_OPTIONS_ACTION_NAME = 'updateOptions';
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
      let { options = {}, optionsVersion } = await chrome.storage.local.get([
        'options',
        'optionsVersion',
      ]);

      // Set version to the latest one if it is not set
      // or trigger migration for older versions
      if (!optionsVersion) {
        chrome.storage.local.set({ optionsVersion: OPTIONS_VERSION });
      } else if (optionsVersion < OPTIONS_VERSION) {
        await migrate(options, optionsVersion);
      }

      // Apply managed options for supported platforms
      if (__PLATFORM__ === 'firefox' || __PLATFORM__ === 'chromium') {
        return manage(options);
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
      chrome.runtime
        .sendMessage({
          action: UPDATE_OPTIONS_ACTION_NAME,
          keys,
        })
        .catch(() => {
          // sendMessage may fail without potential target
        });

      return options;
    },
    observe: (_, options, prevOptions) => {
      OptionsObserver.execute(options, prevOptions);
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

async function migrate(options, optionsVersion) {
  // Pushed in v10.3.14
  if (optionsVersion < 2) {
    // Migrate 'paused' array to record
    if (options.paused) {
      options.paused = options.paused.reduce((acc, { id, revokeAt }) => {
        acc[id] = { revokeAt };
        return acc;
      }, {});
    }

    console.debug('[options] Migrated to version 2:', options);
  }

  // Pushed in v10.4.3
  if (optionsVersion < 3) {
    // Check if the user has custom filters, so we need to
    // reflect the enabled state in the options
    const { text } = await store.resolve(CustomFilters);
    if (text) {
      options.customFilters = {
        ...options.customFilters,
        enabled: true,
      };
    }

    console.debug('[options] Migrated to version 3:', options);
  }

  // Flush updated options and version to the storage
  await chrome.storage.local.set({
    options,
    optionsVersion: OPTIONS_VERSION,
  });
}

let managed = __PLATFORM__ === 'chromium' && isOpera() ? false : null;
async function manage(options) {
  if (managed === false) return options;

  if (managed === null) {
    try {
      managed = await chrome.storage.managed.get(null);
      // Some of the platforms returns an empty object if there are no managed options
      // so we need to check property existence that the managed options are enabled
      managed = Object.keys(managed).length > 0 ? managed : false;
    } catch {
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
