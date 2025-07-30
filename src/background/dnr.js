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

import { ENGINES, getPausedDetails } from '/store/options.js';
import { convertToSafariFormat } from '/utils/dnr-converter-safari.js';
import { FIXES_ID_RANGE, getDynamicRulesIds } from '/utils/dnr.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { ENGINE_CONFIGS_ROOT_URL } from '/utils/urls.js';

if (__PLATFORM__ === 'chromium' || __PLATFORM__ === 'safari') {
  const DNR_RESOURCES = chrome.runtime
    .getManifest()
    .declarative_net_request.rule_resources.filter(({ enabled }) => !enabled)
    .map(({ id }) => id);

  // Ensure that DNR rulesets are equal to those from options.
  // eg. when web extension updates, the rulesets are reset
  // to the value from the manifest.
  OptionsObserver.addListener(async function dnr(options, lastOptions) {
    const globalPause = getPausedDetails(options);

    const ids = ENGINES.map(({ name, key }) => {
      return !globalPause && options.terms && options[key] ? name : '';
    }).filter((id) => id && DNR_RESOURCES.includes(id));

    const enabledRulesetIds =
      (await chrome.declarativeNetRequest.getEnabledRulesets()) || [];

    // Add regional network filters
    if (ids.length && options.regionalFilters.enabled) {
      ids.push(
        ...options.regionalFilters.regions
          .map((id) => `lang-${id}`)
          .filter((id) => DNR_RESOURCES.includes(id)),
      );
    }

    // Add fixes rules
    if (ids.length) {
      const fixesRulesIds = await getDynamicRulesIds(FIXES_ID_RANGE);

      // Fixes should be set when engines are re-enabled and after each update.
      // We can detect re-enabling by checking if both `fixes` static rules
      // and dynamic fixes rules are not present.
      if (
        (!enabledRulesetIds.includes('fixes') && fixesRulesIds.length === 0) ||
        lastOptions?.filtersUpdatedAt < options.filtersUpdatedAt
      ) {
        try {
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: fixesRulesIds,
          });

          let addRules = await fetch(
            `${ENGINE_CONFIGS_ROOT_URL}/dnr-fixes-v2/allowed-lists.json`,
          )
            .then((res) => res.json())
            .then((list) => fetch(list.dnr.url))
            .then((res) => res.json());

          if (__PLATFORM__ === 'safari') {
            addRules = addRules.reduce((acc, rule) => {
              try {
                acc.push(convertToSafariFormat(rule));
              } catch {
                // Ignore rules that cannot be converted
              }
              return acc;
            }, []);
          }

          await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: addRules.map((rule, index) => ({
              ...rule,
              id: FIXES_ID_RANGE.start + index,
            })),
          });

          console.info('[dnr] Updated dynamic fixes rules');
        } catch (e) {
          console.error('[dnr] Error while updating dynamic fixes rules:', e);

          // As a fallback, add the static fixes rules from the resources
          ids.push('fixes');
        }
      }
    } else {
      if (!enabledRulesetIds.includes('fixes')) {
        // Remove all dynamic fixes rules
        const removeRuleIds = await getDynamicRulesIds(FIXES_ID_RANGE);
        if (removeRuleIds.length) {
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds,
          });
          console.info('[dnr] Removed dynamic fixes rules');
        }
      }
    }

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
        console.info('[dnr] Updated static rulesets:', ids.join(', '));
      } catch (e) {
        console.error(`[dnr] Error while updating static rulesets:`, e);
      }
    }
  });
}
