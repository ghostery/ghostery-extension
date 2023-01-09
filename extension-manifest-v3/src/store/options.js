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

const Options = {
  dnrRules: DNR_RULES_LIST.reduce(
    (all, rule) => ({ ...all, [rule]: false }),
    {},
  ),
  autoconsent: {
    all: false,
    allowed: [String],
    disallowed: [String],
    interactions: 0,
  },
  trackerWheel: true,
  wtmSerpReport: true,
  terms: false,
  onboarding: { done: false, shownAt: 0 },
  panel: {
    statsType: 'graph',
  },
  [store.connect]: {
    async get() {
      const { options = await migrateFromMV2() } =
        await chrome.storage.local.get(['options']);

      // Migrate `trackerWheelDisabled` to `trackerWheel`
      // INFO: `trackerWheel` option introduced in v9.7.0
      if (options.trackerWheelDisabled !== undefined) {
        options.trackerWheel = !options.trackerWheelDisabled;
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
    async set(_, options, keys) {
      if (options === null) options = {};

      await chrome.storage.local.set({ options });

      if (keys.includes('paused')) {
        const alarms = await chrome.alarms.getAll();
        const revokeDomains = options.paused.filter(({ revokeAt }) => revokeAt);

        // Clear alarms for removed domains
        alarms.forEach(({ name }) => {
          if (!revokeDomains.find(({ id }) => name === `revoke:${id}`)) {
            chrome.alarms.clear(name);
          }
        });

        // Add alarms for new domains
        if (revokeDomains.length) {
          revokeDomains
            .filter(({ id }) => !alarms.some(({ name }) => name === id))
            .forEach(({ id, revokeAt }) => {
              chrome.alarms.create(`revoke:${id}`, { when: revokeAt });
            });
        }

        // Ensure paused domains are reflected in dynamic rules
        if (options.paused.length) {
          chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [
              {
                id: 1,
                priority: 10000,
                ...(manifest.manifest_version === 3
                  ? {
                      action: { type: 'allowAllRequests' },
                      condition: {
                        requestDomains: options.paused.map(({ id }) => id),
                        resourceTypes: ['main_frame', 'sub_frame'],
                      },
                    }
                  : {
                      action: { type: 'allow' },
                      condition: {
                        urlFilter: '*',
                        domains: options.paused
                          .map(({ id }) => id)
                          .map((d) => [d, `www.${d}`])
                          .flat(),
                      },
                    }),
              },
            ],
            removeRuleIds: [1],
          });
        } else {
          chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1],
          });
        }
      }

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
        (await chrome.declarativeNetRequest.getEnabledRulesets()) || [];

      const enableRulesetIds = [];
      const disableRulesetIds = [];

      DNR_RULES_LIST.forEach((rule) => {
        const enabled = options.dnrRules[rule];
        if (enabledRulesetIds.includes(rule) !== enabled) {
          (enabled ? enableRulesetIds : disableRulesetIds).push(rule);
        }
      });

      if (enableRulesetIds.length || disableRulesetIds.length) {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds,
          disableRulesetIds,
        });
      }
    },
  },
};

if (chrome.declarativeNetRequest.getDynamicRules) {
  // Define `paused` property for keeping paused sites
  Options.paused = [{ id: true, revokeAt: 0 }];

  // Remove paused domains from options when alarm is triggered
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('revoke:')) {
      store.resolve(Options).then((options) => {
        store.set(options, {
          paused: options.paused.filter(
            ({ id }) => `revoke:${id}` !== alarm.name,
          ),
        });
      });
    }
  });
}

export default Options;

async function migrateFromMV2() {
  const options = {};

  try {
    // Only Chrome uses version 3 in the manifest,
    // so it is a good condition to check if we are in Chrome
    if (manifest.manifest_version === 3) {
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

        options.paused = storage.site_whitelist.map((domain) => ({
          id: domain,
          revokeAt: 0,
        }));

        await chrome.storage.local.clear();

        await Promise.all([
          // Clean up indexedDBs
          indexedDB
            .databases()
            .then((dbs) =>
              Promise.all(dbs.map((db) => indexedDB.deleteDatabase(db.name))),
            ),
          // Set options by hand to make sure, that
          // paused side effects are triggered
          Options[store.connect].set(undefined, options, ['paused']),
        ]);
      }
    }
  } catch (e) {
    console.error(`Error while migrating data`, e);
    return options;
  }

  return options;
}

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

    const resolvedOptions = store.resolve(options);

    observers.forEach((fn) => {
      resolvedOptions.then(fn);
    });
  }
});
