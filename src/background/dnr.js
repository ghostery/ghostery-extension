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

import { ENGINES, isPaused } from '/store/options.js';
import * as observer from '/utils/observer.js';

if (__PLATFORM__ === 'chromium' || __PLATFORM__ === 'safari') {
  const DNR_RESOURCES = chrome.runtime
    .getManifest()
    .declarative_net_request.rule_resources.filter(({ enabled }) => !enabled)
    .map(({ id }) => id);

  // Ensure that DNR rulesets are equal to those from options.
  // eg. when web extension updates, the rulesets are reset
  // to the value from the manifest.
  observer.addListener(async (options) => {
    const globalPause = isPaused(options);

    const ids = ENGINES.map(({ name, key }) => {
      return !globalPause && options.terms && options[key] ? name : '';
    }).filter((id) => id && DNR_RESOURCES.includes(id));

    if (ids.length) {
      ids.push('fixes');

      // Add regional network filters
      if (options.regionalFilters.enabled) {
        ids.push(
          ...options.regionalFilters.regions
            .map((id) => `lang-${id}`)
            .filter((id) => DNR_RESOURCES.includes(id)),
        );
      }
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
        console.info('[dnr] Updated with rulesets:', ids.join(', '));
      } catch (e) {
        console.error(`[dnr] Error while updating rulesets:`, e);
      }
    }
  });
}
