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

import * as OptionsObserver from '/utils/options-observer.js';
import { SAFE_MODE_BLOCKED_DOMAINS } from '/utils/safe-mode.js';

import { PAUSED_RULE_PRIORITY, ALL_RESOURCE_TYPES } from './paused.js';

if (__PLATFORM__ === 'chromium' || __PLATFORM__ === 'safari') {
  OptionsObserver.addListener(async function safeMode(options) {
    const removeRuleIds = (await chrome.declarativeNetRequest.getDynamicRules())
      .filter(({ id }) => id >= 10 && id < 13)
      .map(({ id }) => id);

    if (options.safeMode.enabled) {
      const excludedDomains = [
        ...SAFE_MODE_BLOCKED_DOMAINS,
        ...options.safeMode.domains,
      ];

      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules:
          __PLATFORM__ === 'safari'
            ? [
                {
                  id: 10,
                  priority: PAUSED_RULE_PRIORITY,
                  action: { type: 'allow' },
                  condition: {
                    excludedDomains: excludedDomains.map((d) => `*${d}`),
                    excludedRequestDomains: excludedDomains.map((d) => `*${d}`),
                    urlFilter: '*',
                  },
                },
              ]
            : [
                {
                  id: 10,
                  priority: PAUSED_RULE_PRIORITY,
                  action: { type: 'allow' },
                  condition: {
                    excludedInitiatorDomains: excludedDomains,
                    excludedRequestDomains: excludedDomains,
                    resourceTypes: ALL_RESOURCE_TYPES,
                  },
                },
                {
                  id: 11,
                  priority: PAUSED_RULE_PRIORITY,
                  action: { type: 'allowAllRequests' },
                  condition: {
                    excludedInitiatorDomains: excludedDomains,
                    excludedRequestDomains: excludedDomains,
                    resourceTypes: ['main_frame', 'sub_frame'],
                  },
                },
              ],
        removeRuleIds,
      });
      console.log('[safe-mode] Safe mode rules updated');
    } else if (removeRuleIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
      });
      console.log('[safe-mode] Safe mode rules cleared');
    }
  });
}
