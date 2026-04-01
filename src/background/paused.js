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

import Options, { GLOBAL_PAUSE_ID, MODE_DEFAULT } from '/store/options.js';
import * as OptionsObserver from '/utils/options-observer.js';
import ManagedConfig, { TRUSTED_DOMAINS_NONE_ID } from '/store/managed-config';

import { getDynamicRules, PAUSED_ID_RANGE, PAUSED_RULE_PRIORITY } from '/utils/dnr.js';

// Pause / unpause hostnames
const PAUSED_ALARM_PREFIX = 'options:revoke';

OptionsObserver.addListener(async function pausedSites(options, lastOptions) {
  if (options.mode !== MODE_DEFAULT) {
    // Filtering mode has changed - clean up alarms
    if (lastOptions && options.mode !== lastOptions?.mode) {
      (await chrome.alarms.getAll()).forEach(({ name }) => {
        if (name.startsWith(PAUSED_ALARM_PREFIX)) {
          chrome.alarms.clear(name);
        }
      });
    }

    return;
  }

  const alarms = (await chrome.alarms.getAll()).filter(({ name }) =>
    name.startsWith(PAUSED_ALARM_PREFIX),
  );
  const revokeHostnames = Object.entries(options.paused).filter(([, { revokeAt }]) => revokeAt);

  // Clear alarms for removed hostnames
  alarms.forEach(({ name }) => {
    if (!revokeHostnames.find(([id]) => name === `${PAUSED_ALARM_PREFIX}:${id}`)) {
      chrome.alarms.clear(name);
    }
  });

  // Add alarms for new hostnames
  if (revokeHostnames.length) {
    revokeHostnames
      .filter(([id]) => !alarms.some(({ name }) => name === id))
      .forEach(([id, { revokeAt }]) => {
        chrome.alarms.create(`${PAUSED_ALARM_PREFIX}:${id}`, {
          when: revokeAt,
        });
      });
  }

  if (
    __CHROMIUM__ &&
    // Paused state has changed by the user interaction
    ((lastOptions && !OptionsObserver.isOptionEqual(options.paused, lastOptions.paused)) ||
      // Filtering mode has changed
      (lastOptions && options.mode !== lastOptions.mode) ||
      // Managed mode can update the rules at any time - so we need to update
      // the rules on SW restart even if the paused state hasn't changed
      (!lastOptions &&
        (await store.resolve(ManagedConfig)).trustedDomains[0] !== TRUSTED_DOMAINS_NONE_ID))
  ) {
    const currentRules = await getDynamicRules(PAUSED_ID_RANGE);
    const hostnames = Object.keys(options.paused);

    if (hostnames.length) {
      const requestDomains = hostnames.includes(GLOBAL_PAUSE_ID)
        ? // All hostnames, so the requestDomains should be `undefined` to match all domains
          undefined
        : // Sorted hostnames
          hostnames.sort();

      // Skip update if the existing rule already matches the desired state
      try {
        if (currentRules.length) {
          const currentRequestDomains = currentRules[0].condition.requestDomains;

          // Both are undefined (match all)
          if (requestDomains === undefined && currentRequestDomains === undefined) {
            return;
          }

          // Both have the same domains
          if (
            requestDomains &&
            currentRequestDomains &&
            currentRequestDomains.sort().join(',') === requestDomains.join(',')
          ) {
            return;
          }
        }
      } catch (error) {
        console.error('[paused] Failed to compare current rules with desired state', error);
        // Continue with updating the rules to ensure the correct state is applied
      }

      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: 1,
            priority: PAUSED_RULE_PRIORITY,
            action: { type: 'allowAllRequests' },
            condition: { requestDomains, resourceTypes: ['main_frame'] },
          },
        ],
        removeRuleIds: currentRules.map((rule) => rule.id),
      });
      console.log('[paused] Pause rules updated:', hostnames.join(', '));
    } else if (currentRules.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: currentRules.map((rule) => rule.id),
      });
      console.log('[paused] Pause rules cleared');
    }
  }
});

// Remove paused hostname from options when alarm is triggered
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith(PAUSED_ALARM_PREFIX)) {
    const id = alarm.name.slice(PAUSED_ALARM_PREFIX.length + 1);
    store.set(Options, { paused: { [id]: null } });
  }
});
