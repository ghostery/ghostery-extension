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

import Options, { GLOBAL_PAUSE_ID } from '/store/options.js';
import * as OptionsObserver from '/utils/options-observer.js';

// Pause / unpause hostnames
const PAUSED_ALARM_PREFIX = 'options:revoke';
const PAUSED_RULE_PRIORITY = 10000000;

const ALL_RESOURCE_TYPES = [
  'main_frame',
  'sub_frame',
  'stylesheet',
  'script',
  'image',
  'font',
  'object',
  'xmlhttprequest',
  'ping',
  'media',
  'websocket',
  'webtransport',
  'webbundle',
  'other',
];

OptionsObserver.addListener('paused', async (paused, prevPaused) => {
  const alarms = (await chrome.alarms.getAll()).filter(({ name }) =>
    name.startsWith(PAUSED_ALARM_PREFIX),
  );
  const revokeHostnames = Object.entries(paused).filter(
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

  // The background process starts and runs for each tab, so we can assume
  // that this function is called before the user can change the paused state
  // in the panel or the settings page.
  if (
    (__PLATFORM__ === 'chromium' || __PLATFORM__ === 'safari') &&
    prevPaused
  ) {
    const removeRuleIds = (await chrome.declarativeNetRequest.getDynamicRules())
      .filter(({ id }) => id <= 3)
      .map(({ id }) => id);

    const hostnames = Object.keys(paused);

    let globalPause = false;
    if (hostnames.includes(GLOBAL_PAUSE_ID)) {
      globalPause = true;
    }

    if (hostnames.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules:
          __PLATFORM__ === 'safari'
            ? [
                {
                  id: 1,
                  priority: PAUSED_RULE_PRIORITY,
                  action: { type: 'allow' },
                  condition: {
                    domains: globalPause
                      ? undefined
                      : hostnames.map((d) => `*${d}`),
                    urlFilter: '*',
                  },
                },
              ]
            : [
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
              ],
        removeRuleIds,
      });
      console.log('[dnr] pause rules updated');
    } else if (removeRuleIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
      });
      console.log('[dnr] pause rules updated');
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
