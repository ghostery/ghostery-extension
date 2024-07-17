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

import { observe, ENGINES, isPaused } from '/store/options.js';
import { TRACKERDB_ENGINE } from '/utils/engines.js';

if (__PLATFORM__ !== 'firefox') {
  const PAUSE_RULE_PRIORITY = 10000000;

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

  const DNR_RESOURCES = chrome.runtime
    .getManifest()
    .declarative_net_request.rule_resources.filter(({ enabled }) => !enabled)
    .map(({ id }) => id);

  // Ensure that DNR rulesets are equal to those from options.
  // eg. when web extension updates, the rulesets are reset
  // to the value from the manifest.
  observe(async (options) => {
    const globalPause = isPaused(options);

    const ids = ENGINES.map(({ name, key }) => {
      return !globalPause && options.terms && options[key] ? name : '';
    }).filter((id) => id && DNR_RESOURCES.includes(id));

    if (ids.length) {
      ids.push(TRACKERDB_ENGINE, 'fixes');
    }

    const enabledRulesetIds =
      (await chrome.declarativeNetRequest.getEnabledRulesets()) || [];

    const enableRulesetIds = [];
    const disableRulesetIds = [];

    for (const id of ids) {
      if (!enabledRulesetIds.includes(id)) {
        enableRulesetIds.push(id);
      }
    }

    for (const id of enabledRulesetIds) {
      if (!ids.includes(id)) {
        disableRulesetIds.push(id);
      }
    }

    if (enableRulesetIds.length || disableRulesetIds.length) {
      try {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds,
          disableRulesetIds,
        });
        console.info('DNR: lists successfully updated');
      } catch (e) {
        console.error(`DNR: error while updating lists:`, e);
      }
    }
  });

  observe('paused', async (paused, prevPaused) => {
    // The background process starts and runs for each tab, so we can assume
    // that this function is called before the user can change the paused state
    // in the panel or the settings page.
    if (!prevPaused) return;

    const removeRuleIds = (await chrome.declarativeNetRequest.getDynamicRules())
      .filter(({ id }) => id <= 3)
      .map(({ id }) => id);

    const hostnames = Object.keys(paused);

    if (hostnames.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules:
          __PLATFORM__ === 'safari'
            ? [
                {
                  id: 1,
                  priority: PAUSE_RULE_PRIORITY,
                  action: { type: 'allow' },
                  condition: {
                    domains: hostnames.map((d) => `*${d}`),
                    urlFilter: '*',
                  },
                },
              ]
            : [
                {
                  id: 1,
                  priority: PAUSE_RULE_PRIORITY,
                  action: { type: 'allow' },
                  condition: {
                    initiatorDomains: hostnames,
                    resourceTypes: ALL_RESOURCE_TYPES,
                  },
                },
                {
                  id: 2,
                  priority: PAUSE_RULE_PRIORITY,
                  action: { type: 'allow' },
                  condition: {
                    requestDomains: hostnames,
                    resourceTypes: ALL_RESOURCE_TYPES,
                  },
                },
                {
                  id: 3,
                  priority: PAUSE_RULE_PRIORITY,
                  action: { type: 'allowAllRequests' },
                  condition: {
                    initiatorDomains: hostnames,
                    resourceTypes: ['main_frame', 'sub_frame'],
                  },
                },
              ],
        removeRuleIds,
      });
    } else if (removeRuleIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
      });
    }

    console.log('DNR: pause rules updated');
  });
}
