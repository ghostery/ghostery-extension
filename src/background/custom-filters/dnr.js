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

import {
  CUSTOM_FILTERS_ID_RANGE,
  CUSTOM_FILTERS_MAX_DYNAMIC_RULES,
  CUSTOM_FILTERS_MAX_REGEX_RULES,
  getDynamicRulesIds,
} from '/utils/dnr.js';

import Options from '/store/options.js';

import { updateRedirectProtectionRules } from '../redirect-protection.js';

export async function updateDNRRules(dnrRules) {
  if (dnrRules.length > CUSTOM_FILTERS_MAX_DYNAMIC_RULES) {
    throw new Error(
      `Too many custom network filters: ${dnrRules.length} exceeds the maximum of ${CUSTOM_FILTERS_MAX_DYNAMIC_RULES} dynamic rules.`,
    );
  }

  const regexRulesCount = dnrRules.reduce(
    (count, rule) => count + (rule.condition?.regexFilter ? 1 : 0),
    0,
  );
  if (regexRulesCount > CUSTOM_FILTERS_MAX_REGEX_RULES) {
    throw new Error(
      `Too many custom regex network filters: ${regexRulesCount} exceeds the maximum of ${CUSTOM_FILTERS_MAX_REGEX_RULES} regex rules.`,
    );
  }

  const removeRuleIds = await getDynamicRulesIds(CUSTOM_FILTERS_ID_RANGE);

  if (removeRuleIds.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
  }

  if (dnrRules.length) {
    dnrRules = dnrRules.map((rule, index) => ({
      ...rule,
      id: CUSTOM_FILTERS_ID_RANGE.start + index,
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: dnrRules,
    });

    console.info(`[custom filters] DNR updated with rules: ${dnrRules.length}`);
  }

  if (removeRuleIds.length || dnrRules.length) {
    // Reload redirect protection rules to include custom filters changes
    await updateRedirectProtectionRules(await store.resolve(Options));
  }

  return dnrRules;
}
