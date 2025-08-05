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

export const PAUSED_RULE_PRIORITY = 10_000_000;
export const EXCEPTIONS_RULE_PRIORITY = 2_000_000;

export async function getDynamicRulesIds(type) {
  return (await chrome.declarativeNetRequest.getDynamicRules())
    .filter((rule) => rule.id >= type.start && rule.id < type.end)
    .map((rule) => rule.id);
}
