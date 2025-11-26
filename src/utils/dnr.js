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

export const PAUSED_ID_RANGE = { start: 1, end: 1_000_000 };
export const CUSTOM_FILTERS_ID_RANGE = { start: 1_000_000, end: 2_000_000 };
export const EXCEPTIONS_ID_RANGE = { start: 2_000_000, end: 3_000_000 };
export const FIXES_ID_RANGE = { start: 3_000_000, end: 4_000_000 };
export const REDIRECT_PROTECTION_ID_RANGE = {
  start: 4_000_000,
  end: 5_000_000,
};
export const REDIRECT_PROTECTION_SESSION_ID_RANGE = {
  start: 5_000_000,
  end: 6_000_000,
};

export const PAUSED_RULE_PRIORITY = 10_000_000;
export const EXCEPTIONS_RULE_PRIORITY = 2_000_000;
export const REDIRECT_PROTECTION_EXCEPTION_PRIORITY = 200;
export const REDIRECT_PROTECTION_SESSION_PRIORITY = 300;

const MAX_DNR_PRIORITY = 1073741823;

export function filterMaxPriorityRules(rules) {
  return rules.filter((rule) => rule.priority !== MAX_DNR_PRIORITY);
}

export async function getDynamicRulesIds(type) {
  return (await chrome.declarativeNetRequest.getDynamicRules())
    .filter((rule) => rule.id >= type.start && rule.id < type.end)
    .map((rule) => rule.id);
}

export function createRedirectProtectionExceptionRules(
  disabledDomains,
  startId,
) {
  return disabledDomains.map((hostname, index) => ({
    id: startId + index,
    priority: REDIRECT_PROTECTION_EXCEPTION_PRIORITY,
    action: { type: 'allow' },
    condition: {
      urlFilter: `||${hostname}^`,
      resourceTypes: ['main_frame'],
    },
  }));
}

/**
 * Apply redirect protection to DNR rules
 * Converts blocking rules that target main_frame to redirect rules
 *
 * @param {Array} rules - Array of DNR rules
 * @param {Object} options - Options
 * @param {boolean} options.enabled - Whether redirect protection is enabled
 * @param {number} options.priority - Priority for redirect rules (default: 100)
 * @returns {Array} Array with redirect rules added and original rules modified
 */
export function applyRedirectProtection(
  rules,
  { enabled = false, priority = 100 } = {},
) {
  if (!enabled || !rules || !rules.length) {
    return rules;
  }

  const redirectRules = [];
  const modifiedRules = [];

  for (const rule of rules) {
    // Only process blocking rules that include main_frame
    if (
      rule.action?.type === 'block' &&
      rule.condition?.resourceTypes?.includes('main_frame')
    ) {
      // Create a redirect rule with the same condition but only main_frame
      redirectRules.push({
        ...rule,
        priority: priority,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: '/pages/redirect-protection/index.html',
          },
        },
        condition: {
          ...rule.condition,
          resourceTypes: ['main_frame'],
        },
      });

      // If the original rule had other resource types, keep the block rule for those
      const otherTypes = rule.condition.resourceTypes.filter(
        (type) => type !== 'main_frame',
      );
      if (otherTypes.length > 0) {
        modifiedRules.push({
          ...rule,
          condition: {
            ...rule.condition,
            resourceTypes: otherTypes,
          },
        });
      }
    } else {
      // Keep non-blocking rules and rules that don't target main_frame
      modifiedRules.push(rule);
    }
  }

  return [...modifiedRules, ...redirectRules];
}
