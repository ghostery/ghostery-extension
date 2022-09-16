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

const manifest = chrome.runtime.getManifest();

export const DNR_RULES_LIST =
  manifest.declarative_net_request.rule_resources.map((r) => r.id);
const UPDATE_OPTIONS_ACTION_NAME = 'updateOptions';

async function migrateOptions() {
  const options = {};

  try {
    // Only Chrome uses version 3 in the manifest,
    // so it is a good condition to check if we are in Chrome
    if (manifest.version === 3) {
      const storage = await chrome.storage.local.get(null);

      // Proceed if the storage contains data from v2
      if ('version_history' in storage) {
        options.dnrRules = {};
        options.dnrRules.ads = storage.enable_ad_block || false;
        options.dnrRules.tracking = storage.enable_anti_tracking || false;
        options.dnrRules.annoyances = storage.enable_autoconsent || false;

        options.onboarding = {
          done: storage.setup_complete || storage.setup_skip || false,
          shownAt: storage.setup_timestamp || 0,
        };
        options.terms = storage.setup_complete || false;
        options.wtmSerpReport = storage.enable_wtm_serp_report || false;

        options.autoconsent = {
          all: !storage.autoconsent_whitelist,
          allowed: storage.autoconsent_whitelist || [],
          disallowed: storage.autoconsent_blacklist || [],
        };

        // TODO: 'site_whitelist', 'site_blacklist', etc. (generally user's custom rules)
        // TODO: migrate account when it is implemented for v3

        await Promise.all([
          chrome.storage.local.clear(),
          indexedDB
            .databases()
            .then((dbs) =>
              Promise.all(dbs.map((db) => indexedDB.deleteDatabase(db.name))),
            ),
        ]);
      }
    }
  } catch (e) {
    console.error(`Error while migrating data`, e);
    return options;
  }

  await chrome.storage.local.set({ options });
  return options;
}

const Options = {
  dnrRules: DNR_RULES_LIST.reduce(
    (all, rule) => ({ ...all, [rule]: false }),
    {},
  ),
  autoconsent: {
    all: false,
    allowed: [String],
    disallowed: [String],
  },
  trackerWheelDisabled: false,
  wtmSerpReport: true,
  terms: false,
  onboarding: { done: false, shownAt: 0 },
  [store.connect]: {
    async get() {
      const { options = await migrateOptions() } =
        await chrome.storage.local.get(['options']);

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
      await chrome.storage.local.set({ options });

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
    async observe(id, options) {
      // Ensure that DNR rulesets are equal to those from options.
      // eg. when web extension updates, the rulesets are reset
      // to the value from the manifest.

      const enabledRulesetIds =
        await chrome.declarativeNetRequest.getEnabledRulesets();

      const enableRulesetIds = [];
      const disableRulesetIds = [];

      DNR_RULES_LIST.forEach((rule) => {
        const enabled = options.dnrRules[rule];
        if (enabledRulesetIds.includes(rule) !== enabled) {
          (enabled ? enableRulesetIds : disableRulesetIds).push(rule);
        }
      });

      if (enableRulesetIds.length || disableRulesetIds.length) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds,
          disableRulesetIds,
        });
      }
    },
  },
};

export default Options;

const observers = new Set();
export async function observe(property, fn) {
  let value;
  const wrapperFn = (options) => {
    if (value === undefined || options[property] !== value) {
      value = options[property];

      try {
        fn(value);
      } catch (e) {
        console.error('Error while calling options observer', e);
      }
    }
  };

  observers.add(wrapperFn);

  // Run for the first time with the current options
  const options = await store.resolve(Options);
  wrapperFn(options);

  // Return unobserve function
  return () => {
    observers.delete(wrapperFn);
  };
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === UPDATE_OPTIONS_ACTION_NAME) {
    const options = store.get(Options);

    if (!store.pending(options)) {
      store.clear(options, false);
      store.get(Options);
    }

    observers.forEach((fn) => {
      fn(msg.options);
    });
  }

  return false;
});
