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

// We need to depend on `eager` option since dynamic imports are
// not allowed in web workers scope.
const DNR_METADATA = import.meta.glob('/rule_resources/*.metadata.json', { eager: true });

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
