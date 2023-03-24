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

const UPDATE_OPTIONS_ACTION_NAME = 'updateOptions';
const observers = new Set();

const Options = {
  engines: {
    ads: false,
    tracking: false,
    annoyances: false,
  },
  autoconsent: {
    all: false,
    allowed: [String],
    disallowed: [String],
    interactions: 0,
  },
  trackerWheel: true,
  ...(__PLATFORM__ !== 'safari' ? { trackerCount: true } : {}),
  wtmSerpReport: true,
  terms: false,
  onboarding: { done: false, shownAt: 0, shown: 0 },
  panel: {
    statsType: 'graph',
  },
  paused: [{ id: true, revokeAt: 0 }],
  [store.connect]: {
    async get() {
      let { options = __PLATFORM__ !== 'safari' ? migrateFromMV2() : {} } =
        await chrome.storage.local.get(['options']);

      // Migrate `trackerWheelDisabled` to `trackerWheel`
      // INFO: `trackerWheel` option introduced in v9.7.0
      if (options.trackerWheelDisabled !== undefined) {
        options.trackerWheel = !options.trackerWheelDisabled;
      }

      // Migrate `dnrRules` to `engines`
      // INFO: `engines` option introduced in v10.1.0
      if (options.dnrRules) {
        options.engines = options.dnrRules;
      }

      // Set default value for keys, which type does no match the current one
      Object.entries(options).forEach(([key, value]) => {
        if (typeof value !== typeof Options[key]) {
          delete options[key];
          console.warn(`Saved options "${key}" key has wrong type, deleted`);
        }
      });

      return options;
    },
    async set(_, options) {
      if (options === null) options = {};

      await chrome.storage.local.set({
        options:
          // Firefox does not serialize correctly objects with getters
          __PLATFORM__ === 'firefox'
            ? JSON.parse(JSON.stringify(options))
            : options,
      });

      // Send update message to another contexts (background page / panel / options)
      try {
        chrome.runtime.sendMessage({
          action: UPDATE_OPTIONS_ACTION_NAME,
          options,
        });
      } catch (e) {
        console.error(
          `Error while sending update options to other contexts: `,
          e,
        );
      }
      return options;
    },
    observe: (_, options) => {
      observers.forEach((fn) => fn(options));
    },
  },
};

export default Options;

async function migrateFromMV2() {
  try {
    const options = {};
    const storage = await chrome.storage.local.get(null);

    // Proceed if the storage contains data from v2
    if ('version_history' in storage) {
      options.engines = {
        ads: storage.enable_ad_block || false,
        tracking: storage.enable_anti_tracking || false,
        annoyances: storage.enable_autoconsent || false,
      };

      options.onboarding = {
        done: storage.setup_complete || storage.setup_skip || false,
        shownAt: storage.setup_timestamp || 0,
      };
      options.onboarding.shown = options.onboarding.shown
        ? options.onboarding.shown
        : options.onboarding.done
        ? 1
        : 0;
      options.terms = storage.setup_complete || false;
      options.wtmSerpReport = storage.enable_wtm_serp_report || false;

      options.autoconsent = {
        all: !storage.autoconsent_whitelist,
        allowed: storage.autoconsent_whitelist || [],
        disallowed: storage.autoconsent_blacklist || [],
      };

      options.paused = storage.site_whitelist.map((domain) => ({
        id: domain,
        revokeAt: 0,
      }));

      await chrome.storage.local.clear();

      await Promise.all([
        // Clean up indexedDBs
        indexedDB
          .databases?.()
          .then((dbs) =>
            Promise.all(dbs.map((db) => indexedDB.deleteDatabase(db.name))),
          ) ?? Promise.resolve(),
        // Set options by hand to make sure, that
        // paused side effects are triggered
        Options[store.connect].set(undefined, options, ['paused']),
      ]);
    }

    return options;
  } catch (e) {
    console.error(`Error while migrating data`, e);
    return {};
  }
}

export async function observe(property, fn) {
  let value;
  const wrapper = async (options) => {
    if (value === undefined || options[property] !== value) {
      const prevValue = value;
      value = options[property];

      try {
        return await fn(value, prevValue);
      } catch (e) {
        console.error(`Error while observing options: `, e);
      }
    }
  };

  observers.add(wrapper);

  try {
    const options = await store.resolve(Options);
    // let observer know of the option value
    // in case when registered after the store.connect
    // wait for the callback to be fired
    await wrapper(options);
  } catch (e) {
    console.error(e);
  }

  // Return unobserve function
  return () => {
    observers.delete(wrapper);
  };
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === UPDATE_OPTIONS_ACTION_NAME) {
    const options = store.get(Options);

    if (!store.pending(options)) {
      store.clear(options, false);
      store.get(Options);
    }
  }
});
