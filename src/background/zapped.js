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

import Config from '/store/config.js';
import Options, { MODE_DEFAULT, MODE_ZAP } from '/store/options.js';

import { isWebkit } from '/utils/browser-info.js';
import { FLAG_MODES } from '/utils/config-types.js';
import {
  getDynamicRulesIds,
  PAUSED_ID_RANGE,
  PAUSED_RULE_PRIORITY,
} from '/utils/dnr.js';
import * as OptionsObserver from '/utils/options-observer.js';

// Clear filtering mode and zapped data if the flag is removed
store.observe(Config, async (_, config, lastConfig) => {
  if (lastConfig?.hasFlag(FLAG_MODES) && !config.hasFlag(FLAG_MODES)) {
    // Clear out DNR rules related to zap mode
    const removeRuleIds = await getDynamicRulesIds(PAUSED_ID_RANGE);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
    });

    // Reset filtering mode and zapped data
    await store.set(Options, {
      mode: MODE_DEFAULT,
      zapped: null,
    });

    console.log(
      `[zapped] Filtering mode flag removed, resetting filtering mode and zapped data`,
    );
  }
});

if (__PLATFORM__ !== 'firefox') {
  OptionsObserver.addListener(async function zapped(options, lastOptions) {
    if (
      // No changes in options
      !lastOptions ||
      // Filtering mode is not zap
      options.mode !== MODE_ZAP ||
      // Filtering mode didn't change and 'zapped' option is equal
      (options.mode === lastOptions.mode &&
        OptionsObserver.isOptionEqual(options.zapped, lastOptions.zapped))
    ) {
      return;
    }

    const removeRuleIds = await getDynamicRulesIds(PAUSED_ID_RANGE);
    const excludedDomains = Object.keys(options.zapped);

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        isWebkit()
          ? // Safari/WebKit has a bug with setting excludedRequestDomains,
            // it simply doesn't work and still allow on excluded domains
            // the only way is to use `allow` action with excludedInitiatorDomains
            {
              id: 1,
              priority: PAUSED_RULE_PRIORITY,
              action: { type: 'allow' },
              condition: { excludedInitiatorDomains: excludedDomains },
            }
          : {
              id: 1,
              priority: PAUSED_RULE_PRIORITY,
              action: { type: 'allowAllRequests' },
              condition: { excludedRequestDomains: excludedDomains },
              resource_types: ['main_frame'],
            },
      ],
      removeRuleIds,
    });

    console.log(`[zapped] Zap mode rules updated`);
  });
}
