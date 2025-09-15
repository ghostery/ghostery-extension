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
import { isOpera, isSafari } from '/utils/browser-info.js';

import CustomFilters from './custom-filters.js';
import ManagedConfig from './managed-config.js';

const UPDATE_OPTIONS_ACTION_NAME = 'updateOptions';
export const GLOBAL_PAUSE_ID = '<all_urls>';

export const ENGINES = [
  { name: 'ads', key: 'blockAds' },
  { name: 'tracking', key: 'blockTrackers' },
  { name: 'annoyances', key: 'blockAnnoyances' },
];

const LOCAL_OPTIONS = [
  'autoconsent',
  'terms',
  'feedback',
  'sync',
  'revision',
  'filtersUpdatedAt',
];
const PROTECTED_OPTIONS = ['exceptions', 'paused'];

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

  // Experimental features
  autoconsent: { autoAction: 'optOut' },
  experimentalFilters: false,

  // SERP protection
  serpTrackingPrevention: true,

  // WhoTracks.Me
  wtmSerpReport: true,
  trackerWheel: false,
  ...(!isSafari() ? { trackerCount: true } : {}),
  pauseAssistant: true,

  // Onboarding
  terms: false,
  feedback: true,
  onboarding: {
    shown: 0,
    ...(__PLATFORM__ !== 'firefox' && isOpera()
      ? { serpShownAt: 0, serpShown: 0 }
      : {}),
    ...(__PLATFORM__ !== 'firefox' ? { pinIt: false } : {}),
  },

  // UI
  panel: { statsType: 'graph', notifications: true },
  theme: '',

  // Tracker exceptions
  exceptions: store.record({ global: false, domains: [String] }),

  // Paused domains
  paused: store.record({ revokeAt: 0, assist: false }),

  // Sync & Update
  sync: true,
  revision: 0,
  filtersUpdatedAt: 0,

  // What's new
  whatsNewVersion: 0,

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
      if (__PLATFORM__ === 'firefox' || __PLATFORM__ !== 'firefox') {
        return manage(options);
      }

      return options;
    },
    async set(_, options) {
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

      return options;
    },
  },
};

export const SYNC_OPTIONS = Object.keys(Options).filter(
  (key) => !LOCAL_OPTIONS.includes(key),
);

export const REPORT_OPTIONS = [
  ...SYNC_OPTIONS.filter((key) => !PROTECTED_OPTIONS.includes(key)),
  'filtersUpdatedAt',
];

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

async function manage(options) {
  const managed = await store.resolve(ManagedConfig);

  if (managed.disableOnboarding === true) {
    options.terms = true;
    options.onboarding = { shown: 1 };
  }

  if (managed.disableUserControl === true) {
    options.sync = false;

    // Clear out the paused state, to overwrite with the current managed state
    options.paused = {};
  }

  if (managed.disableUserAccount === true) {
    options.sync = false;
  }

  if (managed.disableTrackersPreview === true) {
    options.wtmSerpReport = false;
  }

  managed.trustedDomains.forEach((domain) => {
    options.paused ||= {};
    options.paused[domain] = { revokeAt: 0 };
  });

  return options;
}

export function getPausedDetails(options, hostname = '') {
  if (options.paused[GLOBAL_PAUSE_ID]) {
    return options.paused[GLOBAL_PAUSE_ID];
  }

  if (!hostname) return null;

  const pausedHostname = Object.keys(options.paused).find((domain) =>
    hostname.endsWith(domain),
  );

  return pausedHostname ? options.paused[pausedHostname] : null;
}
