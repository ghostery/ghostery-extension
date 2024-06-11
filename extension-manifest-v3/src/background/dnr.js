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

import { observe, ENGINES, isGlobalPaused } from '/store/options.js';
import { TRACKERDB_ENGINE } from '/utils/engines.js';

const PAUSE_RULE_PRIORITY = 10000000;

if (__PLATFORM__ !== 'firefox') {
  const DNR_RESOURCES = chrome.runtime
    .getManifest()
    .declarative_net_request.rule_resources.filter(({ enabled }) => !enabled)
    .map(({ id }) => id);

  // Ensure that DNR rulesets are equal to those from options.
  // eg. when web extension updates, the rulesets are reset
  // to the value from the manifest.
  observe(null, async (options) => {
    const globalPause = isGlobalPaused(options);
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
        console.info('DNR - Lists successfully updated');
      } catch (e) {
        console.error(`DNR - Error while updating lists:`, e);
      }
    }
  });

  observe('paused', async (paused, prevPaused) => {
    // Skip if hostnames has not changed
    if (!prevPaused) return;

    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();

    if (paused.length) {
      const hostnames = paused.map(({ id }) => id);

      chrome.declarativeNetRequest.updateDynamicRules({
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
                    resourceTypes: [
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
                    ],
                  },
                },
                {
                  id: 2,
                  priority: PAUSE_RULE_PRIORITY,
                  action: { type: 'allowAllRequests' },
                  condition: {
                    initiatorDomains: hostnames,
                    resourceTypes: ['main_frame', 'sub_frame'],
                  },
                },
              ],
        removeRuleIds: dynamicRules.map(({ id }) => id),
      });
    } else if (dynamicRules.length) {
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: __PLATFORM__ === 'safari' ? [1] : [1, 2],
      });
    }
  });
}
