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

import { FILTERING_MODE_ZAP } from '/store/options.js';

import * as OptionsObserver from '/utils/options-observer.js';
import {
  getDynamicRulesIds,
  PAUSED_ID_RANGE,
  PAUSED_RULE_PRIORITY,
  ALL_RESOURCE_TYPES,
} from '/utils/dnr.js';

if (__PLATFORM__ !== 'firefox') {
  OptionsObserver.addListener(async function zapped(options, lastOptions) {
    if (
      options.filteringMode !== FILTERING_MODE_ZAP || // Filtering mode is not zap
      !lastOptions || // No changes in options
      (options.filteringMode === lastOptions.filteringMode && // Filtering mode didn't change and 'zapped' option is equal
        OptionsObserver.isOptionEqual(options.zapped, lastOptions.zapped))
    ) {
      return;
    }

    const removeRuleIds = await getDynamicRulesIds(PAUSED_ID_RANGE);
    const excludedDomains = Object.keys(options.zapped);

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 1,
          priority: PAUSED_RULE_PRIORITY,
          action: { type: 'allow' },
          condition: {
            excludedInitiatorDomains: excludedDomains,
            excludedRequestDomains: excludedDomains,
            resourceTypes: ALL_RESOURCE_TYPES,
          },
        },
        {
          id: 2,
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

    console.log(`[zapped] Zap mode rules updated`);
  });
}
