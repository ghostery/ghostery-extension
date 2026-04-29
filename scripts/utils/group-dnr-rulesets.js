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

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const DOMAIN_BLOCKING_PATTERN = /^\|\|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\^$/;

function cutPuncBy100(n) {
  return Math.trunc(n * 100) / 100;
}

function groupRuleset(ruleset, metadata) {
  const hostnames = new Set();
  const result = [];
  for (const rule of ruleset) {
    if (
      // Skip a rule in the metadata
      !(rule.id in metadata) &&
      // Pick 'block' type of rule with simple network hostname pattern
      rule.action.type === 'block' &&
      // Pick the simplest condition only with urlFilter satisfying PATTERN
      Object.keys(rule.condition).length === 1 &&
      rule.condition?.urlFilter?.match(DOMAIN_BLOCKING_PATTERN) &&
      // Pick the rule with priority of 1
      rule.priority === 1
    ) {
      // Extract host from ||example.com^ pattern
      hostnames.add(rule.condition.urlFilter.slice(2, -1));
    } else {
      result.push(rule);
    }
  }

  // Empty `requestDomains` is not allowed by the format.
  if (hostnames.size > 0) {
    result.push({
      // The rule id starts with 1, we top up 2
      id: ruleset.length + 2,
      priority: 1,
      action: {
        type: 'block',
      },
      condition: {
        requestDomains: Array.from(hostnames),
      },
    });
  }

  return result;
}

/**
 * Groups a single DNR ruleset file in place. Safe to call repeatedly:
 * once a ruleset is grouped, its combined rule uses `requestDomains` instead
 * of `urlFilter` and is no longer matched by the grouping pattern.
 *
 * @param {string} rulesetPath Absolute path to the ruleset JSON file.
 * @returns {{ before: number, after: number }}
 */
export function groupRulesetFile(rulesetPath) {
  const metadataPath = rulesetPath.replace(/\.json$/, '.metadata.json');

  const ruleset = JSON.parse(readFileSync(rulesetPath, 'utf8'));
  const metadata = existsSync(metadataPath) ? JSON.parse(readFileSync(metadataPath, 'utf8')) : {};

  const newRuleset = groupRuleset(ruleset, metadata);

  writeFileSync(rulesetPath, JSON.stringify(newRuleset), 'utf8');

  const before = ruleset.length;
  const after = newRuleset.length;
  const ratio = cutPuncBy100(after / before);

  process.stdout.write(` grouping: ${before} -> ${after} (${ratio})...`);

  return { before, after };
}
