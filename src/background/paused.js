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

import Options, {
  GLOBAL_PAUSE_ID,
  FILTERING_MODE_GHOSTERY,
} from '/store/options.js';
import * as OptionsObserver from '/utils/options-observer.js';
import ManagedConfig, { TRUSTED_DOMAINS_NONE_ID } from '/store/managed-config';

import {
  getDynamicRulesIds,
  PAUSED_ID_RANGE,
  PAUSED_RULE_PRIORITY,
  ALL_RESOURCE_TYPES,
} from '/utils/dnr.js';

// Pause / unpause hostnames
const PAUSED_ALARM_PREFIX = 'options:revoke';

OptionsObserver.addListener(async function pausedSites(options, lastOptions) {
  if (options.filteringMode !== FILTERING_MODE_GHOSTERY) {
    // Filtering mode has changed - clean up alarms
    if (lastOptions && options.filteringMode !== lastOptions?.filteringMode) {
      const alarms = (await chrome.alarms.getAll()).filter(({ name }) =>
        name.startsWith(PAUSED_ALARM_PREFIX),
      );
      alarms.forEach(({ name }) => {
        chrome.alarms.clear(name);
      });
    }

    return;
  }

  const alarms = (await chrome.alarms.getAll()).filter(({ name }) =>
    name.startsWith(PAUSED_ALARM_PREFIX),
  );
  const revokeHostnames = Object.entries(options.paused).filter(
    ([, { revokeAt }]) => revokeAt,
  );

  // Clear alarms for removed hostnames
  alarms.forEach(({ name }) => {
    if (
      !revokeHostnames.find(([id]) => name === `${PAUSED_ALARM_PREFIX}:${id}`)
    ) {
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

  if (__PLATFORM__ !== 'firefox') {
    if (
      // The background process starts and runs for each tab, so we can assume
      // that this function is called before the user can change the paused state
      // in the panel or the settings page.
      !OptionsObserver.isOptionEqual(options.paused, lastOptions?.paused) ||
      // Filtering mode has changed
      (lastOptions && options.filteringMode !== lastOptions?.filteringMode) ||
      // Managed mode can update the rules at any time - so we need to update
      // the rules even if the paused state hasn't changed
      (await store.resolve(ManagedConfig)).trustedDomains[0] !==
        TRUSTED_DOMAINS_NONE_ID
    ) {
      const removeRuleIds = await getDynamicRulesIds(PAUSED_ID_RANGE);
      const hostnames = Object.keys(options.paused);

      let globalPause = false;
      if (hostnames.includes(GLOBAL_PAUSE_ID)) {
        globalPause = true;
      }

      if (hostnames.length) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          addRules: [
            {
              id: 1,
              priority: PAUSED_RULE_PRIORITY,
              action: { type: 'allow' },
              condition: {
                initiatorDomains: globalPause ? undefined : hostnames,
                resourceTypes: ALL_RESOURCE_TYPES,
              },
            },
            {
              id: 2,
              priority: PAUSED_RULE_PRIORITY,
              action: { type: 'allow' },
              condition: {
                requestDomains: globalPause ? undefined : hostnames,
                resourceTypes: ALL_RESOURCE_TYPES,
              },
            },
            {
              id: 3,
              priority: PAUSED_RULE_PRIORITY,
              action: { type: 'allowAllRequests' },
              condition: {
                initiatorDomains: globalPause ? undefined : hostnames,
                resourceTypes: ['main_frame', 'sub_frame'],
              },
            },
            {
              id: 4,
              priority: PAUSED_RULE_PRIORITY,
              action: { type: 'allowAllRequests' },
              condition: {
                requestDomains: globalPause ? undefined : hostnames,
                resourceTypes: ['main_frame', 'sub_frame'],
              },
            },
          ],
          removeRuleIds,
        });
        console.log('[paused] Pause rules updated:', hostnames.join(', '));
      } else if (removeRuleIds.length) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds,
        });
        console.log('[paused] Pause rules cleared');
      }
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
