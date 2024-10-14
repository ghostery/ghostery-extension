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

export function convert(r) {
  const rule = structuredClone(r);
  if (rule.action.type === 'modifyHeaders' || rule.action.type === 'redirect') {
    throw new Error(
      'action types modifyHeaders and redirect require declarativeNetRequestWithHostAccess permission and <all_urls> host permission',
    );
  }

  // Based on https://github.com/w3c/webextensions/issues/344#issuecomment-1430358116
  if (
    rule.condition.regexFilter?.match(/(\{\d*,\d*\})/) ||
    rule.condition.regexFilter?.match(/(\{\d+\})/)
  ) {
    throw new Error(`regexp not supported: {n,m} quantifier`);
  }

  if (rule.condition.regexFilter?.match(/\(([^()]*[|][^()]*)\)/)) {
    throw new Error(`regexp not supported : | - capture group disjunction`);
  }

  if (
    rule.action.type === 'allowAllRequests' &&
    (!rule.condition.resourceTypes ||
      rule.condition.resourceTypes.length !== 1 ||
      rule.condition.resourceTypes[0] !== 'main_frame')
  ) {
    throw new Error(
      'action type allowAllRequests is only allowed for resourceType main_frame',
    );
  }

  // Safari does not support initiatorDomains
  if (rule.condition.initiatorDomains) {
    const domains = rule.condition.initiatorDomains;
    delete rule.condition.initiatorDomains;
    rule.condition.domains = [
      ...(rule.condition.domains || []),
      ...domains,
      ...domains.map((domain) => `*.${domain}`),
    ];
  }

  // Safari does not support excludedInitiatorDomains
  if (rule.condition.excludedInitiatorDomains) {
    const domains = rule.condition.excludedInitiatorDomains;
    delete rule.condition.excludedInitiatorDomains;
    rule.condition.excludedDomains = [
      ...(rule.condition.excludedDomains || []),
      ...domains,
      ...domains.map((domain) => `*.${domain}`),
    ];
  }

  return rule;
}
