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

export const DNR_RULES_LIST = chrome.runtime
  .getManifest()
  .declarative_net_request.rule_resources.map((r) => r.id);

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
  [store.connect]: {
    async get() {
      const { options = {} } = await chrome.storage.local.get(['options']);

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
    async set(_, options) {
      if (options === null) options = {};

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

      // Ensure paused domains are reflected in dynamic rule
      if (options.paused) {
        const [rule] = await chrome.declarativeNetRequest.getDynamicRules();
        const pausedDomains = options.paused.map(String);

        const initiatorDomains = rule?.condition.initiatorDomains || [];
        if (pausedDomains.length) {
          if (
            pausedDomains.some(
              (domain, index) => initiatorDomains[index] !== domain,
            )
          ) {
            chrome.declarativeNetRequest.updateDynamicRules({
              addRules: [
                {
                  id: 1,
                  priority: 10000,
                  action: {
                    type: 'allowAllRequests',
                  },
                  condition: {
                    requestDomains: pausedDomains,
                    resourceTypes: ['main_frame'],
                  },
                },
              ],
              removeRuleIds: rule ? [1] : undefined,
            });
          }
        } else if (rule) {
          chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [rule.id],
          });
        }

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
      }
    },
  },
};

if (chrome.declarativeNetRequest.getDynamicRules) {
  // Define `paused` property for keeping paused sites
  Options.paused = [{ id: true, revokeAt: 0 }];

  // Remove paused domains from dynamic rule when alarm is triggered
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('revoke:')) {
      console.log('Revoke paused domain', alarm.name);

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
