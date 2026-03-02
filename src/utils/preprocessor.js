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

import { evaluatePreprocessor } from '@ghostery/adblocker';

export const ENV = new Map([
  ['ext_ghostery', true],
  ['ext_ublock', true],
  ['ext_ubol', checkUserAgent('Firefox')],
  ['cap_html_filtering', checkUserAgent('Firefox')],
  // can be removed in once $replace support is sufficiently distributed
  ['cap_replace_modifier', checkUserAgent('Firefox')],
  ['cap_user_stylesheet', true],
  ['env_firefox', checkUserAgent('Firefox')],
  ['env_chromium', checkUserAgent('Chrome')],
  ['env_edge', checkUserAgent('Edg')],
  ['env_mobile', checkUserAgent('Mobile')],
  ['env_experimental', false],
]);

// We need to depend on `eager` option since dynamic imports are
// not allowed in web workers scope.
const DNR_METADATA = import.meta.glob('/rule_resources/*.metadata.json', { eager: true });

function checkUserAgent(pattern) {
  return navigator.userAgent.indexOf(pattern) !== -1;
}

/**
 * @param {string} rulesetId
 * @returns {number[]}
 */
export function getExcludedRuleIdsByPreprocessors(rulesetId) {
  const metadata = DNR_METADATA[`/rule_resources/dnr-${rulesetId}.metadata.json`];
  const disabledRuleIds = [];
  if (typeof metadata === 'undefined') {
    return disabledRuleIds;
  }
  for (const [ruleId, constraints] of Object.entries(metadata)) {
    if (!evaluatePreprocessor(constraints.preprocessor)) {
      disabledRuleIds.push(Number(ruleId));
    }
  }
  return disabledRuleIds;
}
