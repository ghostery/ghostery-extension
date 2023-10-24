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

import { observe, ENGINES } from '/store/options.js';
import { setDNRRules } from '/utils/custom-filters.js';

async function updateDNRRules(dnrRules) {
  const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: dynamicRules
      // ids between 1 and 2 million are reserved for dynamic rules
      .filter(({ id }) => id >= 1000000 && id < 2000000)
      .map(({ id }) => id),
  });

  const addRules = dnrRules.map((rule, index) => ({
    ...rule,
    id: 1000000 + index,
  }));
  await chrome.declarativeNetRequest.updateDynamicRules({ addRules });

  await setDNRRules(dnrRules);

  return dnrRules;
}

if (__PLATFORM__ !== 'firefox') {
  const DNR_RESOURCES = chrome.runtime
    .getManifest()
    .declarative_net_request.rule_resources.map(({ id }) => id);

  // Ensure that DNR rulesets are equal to those from options.
  // eg. when web extension updates, the rulesets are reset
  // to the value from the manifest.
  observe(null, async (options) => {
    const enabledRulesetIds =
      (await chrome.declarativeNetRequest.getEnabledRulesets()) || [];

    const enableRulesetIds = [];
    const disableRulesetIds = [];

    ENGINES.forEach(({ name, key }) => {
      if (!DNR_RESOURCES.includes(name)) return;

      const enabled = options.terms && options[key];
      if (enabledRulesetIds.includes(name) !== enabled) {
        (enabled ? enableRulesetIds : disableRulesetIds).push(name);
      }
    });

    if (enableRulesetIds.length || disableRulesetIds.length) {
      try {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds,
          disableRulesetIds,
        });
        console.log('DNR - Lists successfully updated');
      } catch (e) {
        console.error(`DNR - Error while updating lists:`, e);
      }
    }
  });

  observe('paused', async (paused, prevPaused) => {
    // Skip if domains has not changed
    if (!prevPaused) return;

    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();

    if (paused.length) {
      const domains = paused.map(({ id }) => id);

      chrome.declarativeNetRequest.updateDynamicRules({
        addRules:
          __PLATFORM__ === 'safari'
            ? [
                {
                  id: 1,
                  priority: 10000,
                  action: { type: 'allow' },
                  condition: {
                    domains: domains.map((d) => `*${d}`),
                    urlFilter: '*',
                  },
                },
              ]
            : [
                {
                  id: 1,
                  priority: 10000,
                  action: { type: 'allow' },
                  condition: {
                    initiatorDomains: domains,
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
                  priority: 10000,
                  action: { type: 'allowAllRequests' },
                  condition: {
                    initiatorDomains: domains,
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

  chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    if (msg.action === 'custom-filters:update-dnr') {
      updateDNRRules(msg.dnrRules).then(sendResponse);
      return true;
    }
  });
}
