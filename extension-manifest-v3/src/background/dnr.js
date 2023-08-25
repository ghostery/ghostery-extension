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

if (__PLATFORM__ !== 'firefox') {
  // Ensure that DNR rulesets are equal to those from options.
  // eg. when web extension updates, the rulesets are reset
  // to the value from the manifest.
  observe(null, async (options) => {
    const enabledRulesetIds =
      (await chrome.declarativeNetRequest.getEnabledRulesets()) || [];

    const enableRulesetIds = [];
    const disableRulesetIds = [];

    ENGINES.forEach(({ name, option }) => {
      const enabled = options.terms && options[option];
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

    if (paused.length) {
      const domains = paused.map(({ id }) => id);
      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          __PLATFORM__ === 'safari'
            ? {
                id: 1,
                priority: 10000,
                action: { type: 'allow' },
                condition: {
                  domains: domains.map((d) => `*${d}`),
                  urlFilter: '*',
                },
              }
            : {
                id: 1,
                priority: 10000,
                action: { type: 'allowAllRequests' },
                condition: {
                  requestDomains: domains,
                  resourceTypes: ['main_frame', 'sub_frame'],
                },
              },
        ],
        removeRuleIds: [1],
      });
    } else {
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1],
      });
    }
  });
}
