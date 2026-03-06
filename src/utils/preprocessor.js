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

import { ENV } from './engines.js';

// We need to depend on `eager` option since dynamic imports are
// not allowed in web workers scope.
const DNR_METADATA = import.meta.glob('/rule_resources/*.metadata.json', {
  eager: true,
  import: 'default',
});

/**
 * @param {string} rulesetId
 * @returns {Promise<number[]>}
 */
export async function disableExcludedRulesByPreprocessor(rulesetId) {
  const metadata = DNR_METADATA[`/rule_resources/dnr-${rulesetId}.metadata.json`];
  if (!metadata) {
    return [];
  }
  const disableRuleIds = Object.entries(metadata).reduce(function (
    disabledRuleIds,
    [ruleId, constraints],
  ) {
    if (!evaluatePreprocessor(constraints.preprocessor, ENV)) {
      disabledRuleIds.push(Number(ruleId));
    }
  }, []);
  await chrome.declarativeNetRequest.updateStaticRules({
    rulesetId: rulesetId,
    disableRuleIds,
  });
  return disableRuleIds;
}
