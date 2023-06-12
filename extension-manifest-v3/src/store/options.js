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

import Session from './session.js';
import { getUserOptions, setUserOptions } from '/utils/api.js';

const UPDATE_OPTIONS_ACTION_NAME = 'updateOptions';
const observers = new Set();

export const SYNC_OPTIONS = [
  'engines',
  'trackerWheel',
  'trackerCount',
  'wtmSerpReport',
  'panel',
  'revision',
];

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
  installDate: '',
  sync: true,
  revision: 0,
  [store.connect]: {
    async get() {
      let { options = __PLATFORM__ !== 'safari' ? migrateFromMV2() : {} } =
        await chrome.storage.local.get(['options']);

      // Migrate `dnrRules` to `engines`
      // INFO: `engines` option introduced in v10.0.1
      if (options.dnrRules) {
        options.engines = options.dnrRules;
      }

      // Fetch options from the server for logged in users
      if (options.terms && options.sync) {
        const serverOptions = await getUserOptions();
        if (serverOptions && serverOptions.revision > options.revision) {
          for (const key of SYNC_OPTIONS) {
            options[key] = serverOptions[key];
          }
          this.set(null, options, SYNC_OPTIONS.concat(['revision']));
        }
      }

      return options;
    },
    async set(_, options = {}, keys) {
      if (!keys.includes('revision')) {
        options = Object.assign({}, options, {
          revision:
            options.terms && options.sync && (await store.resolve(Session)).user
              ? Date.now()
              : 0,
        });

        // Sync options for logged in users
        if (options.terms && options.sync) {
          const serverOptions = await getUserOptions();
          if (serverOptions) {
            // Merge local options with newer server options
            // but only not currently set keys
            if (serverOptions.revision) {
              for (const key of SYNC_OPTIONS) {
                if (key === 'revision' || keys.includes(key)) continue;
                options[key] = hasOwnProperty.call(serverOptions, key)
                  ? serverOptions[key]
                  : options[key];
              }
            }

            // Send only sync options to the server
            await setUserOptions(
              SYNC_OPTIONS.reduce((acc, key) => {
                acc[key] = options[key];
                return acc;
              }, {}),
            );
          }
        }
      }

      await chrome.storage.local.set({
        options:
          // Firefox does not serialize correctly objects with getters
          __PLATFORM__ === 'firefox'
            ? JSON.parse(JSON.stringify(options))
            : options,
      });

      // Send update message to another contexts (background page / panel / options)
      chrome.runtime
        .sendMessage({ action: UPDATE_OPTIONS_ACTION_NAME })
        // The function only throws if the other end does not exist. Mainly, it happens
        // when the background process starts, but there is no other content script or
        // extension page, which could receive a message.
        .catch(() => {});

      return options;
    },
    observe: (_, options, prevOptions) => {
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
        'insights',
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
