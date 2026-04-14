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

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DOMAIN_BLOCKING_PATTERN = /^\|\|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\^$/;

const dist = join(import.meta.dirname, '../dist/rule_resources');
const source = join(import.meta.dirname, '../src/rule_resources');

function cutPuncBy100(n) {
  return Math.trunc(n * 100) / 100;
}

function getRulesetIds() {
  if (existsSync(dist) === false) {
    console.warn(
      'The destination directory is not available! Please try again after building the extension.',
    );
    process.exit(0);
  }

  return readdirSync(dist, { withFileTypes: true }).reduce(function (ids, descriptor) {
    if (
      descriptor.isFile() &&
      // Is a JSON file
      descriptor.name.endsWith('.json') &&
      // Not a metadata file
      descriptor.name.endsWith('.metadata.json') === false &&
      // Not a redirect-protection (this won't have any rules targeted by "groupRuleset" but for safety)
      descriptor.name.includes('redirect-protection') === false
    ) {
      ids.push(descriptor.name);
    }
    return ids;
  }, []);
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
      rule.condition?.urlFilter?.match(DOMAIN_BLOCKING_PATTERN)
    ) {
      // Extract host from ||example.com^ pattern
      hostnames.add(rule.condition.urlFilter.slice(2, -1));
    } else {
      result.push(rule);
    }
  }

  result.push({
    // The rule id starts with 1, we top up 2
    id: ruleset.length + 2,
    action: {
      type: 'block',
    },
    requestDomains: Array.from(hostnames),
  });

  return result;
}

const grandTotal = {
  ruleset: 0,
  newRuleset: 0,
};

for (const id of getRulesetIds()) {
  const rulesetPath = join(source, id);
  const metadataPath = join(source, id.replace('.json', '.metadata.json'));
  const distPath = join(dist, id);

  const ruleset = JSON.parse(readFileSync(rulesetPath, 'utf8'));
  const metadata = existsSync(metadataPath) ? JSON.parse(readFileSync(metadataPath, 'utf8')) : {};

  const newRuleset = groupRuleset(ruleset, metadata);

  grandTotal.ruleset += ruleset.length;
  grandTotal.newRuleset += newRuleset.length;
  const ratio = cutPuncBy100(newRuleset.length / ruleset.length);

  console.log(`id="${id}" before=${ruleset.length} after=${newRuleset.length} ratio=${ratio}`);

  writeFileSync(distPath, JSON.stringify(newRuleset), 'utf8');
}

const grandTotalRatio = cutPuncBy100(grandTotal.newRuleset / grandTotal.ruleset);
console.log(
  `Reduced ${grandTotal.ruleset} rules into ${grandTotal.newRuleset} rules with ratio of ${grandTotalRatio}`,
);
