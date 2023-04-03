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

import { observe } from '/store/options.js';

if (__PLATFORM__ !== 'firefox') {
  // Ensure that DNR rulesets are equal to those from options.
  // eg. when web extension updates, the rulesets are reset
  // to the value from the manifest.
  observe('engines', async (engines) => {
    const enabledRulesetIds =
      (await chrome.declarativeNetRequest.getEnabledRulesets()) || [];

    const enableRulesetIds = [];
    const disableRulesetIds = [];

    Object.entries(engines).forEach(([rule, enabled]) => {
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
  });

  const manifest = chrome.runtime.getManifest();
  observe('paused', async (paused, prevPaused) => {
    // Skip if domains has not changed
    if (!prevPaused) return;

    if (paused.length) {
      const domains = paused.map(({ id }) => id);
      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: 1,
            priority: 10000,
            ...(manifest.manifest_version === 3
              ? {
                  action: { type: 'allowAllRequests' },
                  condition: {
                    requestDomains: domains,
                    resourceTypes: ['main_frame', 'sub_frame'],
                  },
                }
              : {
                  action: { type: 'allow' },
                  condition: {
                    urlFilter: '*',
                    domains: domains.map((d) => [d, `www.${d}`]).flat(),
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
  });
}
