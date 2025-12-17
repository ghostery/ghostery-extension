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

// Dynamic Rules ID Ranges and Priorities

export const PAUSED_ID_RANGE = { start: 1, end: 1_000_000 };
export const CUSTOM_FILTERS_ID_RANGE = { start: 1_000_000, end: 2_000_000 };
export const EXCEPTIONS_ID_RANGE = { start: 2_000_000, end: 3_000_000 };
export const FIXES_ID_RANGE = { start: 3_000_000, end: 4_000_000 };
export const REDIRECT_PROTECTION_ID_RANGE = {
  start: 4_000_000,
  end: 5_000_000,
};
export const REDIRECT_PROTECTION_EXCEPTIONS_ID_RANGE = {
  start: 5_000_000,
  end: 6_000_000,
};

export const PAUSED_RULE_PRIORITY = 10_000_000;
export const EXCEPTIONS_RULE_PRIORITY = 2_000_000;
export const MAX_RULE_PRIORITY = 1_073_741_823;

export const ALL_RESOURCE_TYPES = [
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
];

export function filterMaxPriorityRules(rules) {
  return rules.filter((rule) => rule.priority !== MAX_RULE_PRIORITY);
}

export async function getDynamicRules(type) {
  return (await chrome.declarativeNetRequest.getDynamicRules()).filter(
    (rule) => rule.id >= type.start && rule.id < type.end,
  );
}

export async function getDynamicRulesIds(type) {
  return (await getDynamicRules(type)).map((rule) => rule.id);
}

export function getRedirectProtectionRules(rules) {
  const result = [];

  for (const rule of rules) {
    if (
      rule.action?.type === 'block' &&
      rule.condition?.resourceTypes?.includes('main_frame')
    ) {
      result.push({
        ...rule,
        priority: rule.priority + 1,
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
    }
  }

  return result;
}
