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

export const rulesetIds = chrome.runtime
  .getManifest()
  .declarative_net_request.rule_resources.map((r) => r.id);

export function getRulesetType(rulesetId) {
  return rulesetId.split('_')[0];
}

export const toggles = rulesetIds.map(getRulesetType);
