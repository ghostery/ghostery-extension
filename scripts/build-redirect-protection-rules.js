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

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { RESOURCES_PATH } from './utils/urls.js';

// Import the shared utility for applying redirect protection
// This is the same logic used in custom-filters.js and dnr.js
import { applyRedirectProtection } from '../src/utils/dnr.js';

/**
 * Extract DNR rule conditions for main_frame blocking rules
 * Returns array of conditions that can be used for redirect rules
 *
 * NOTE: This function is kept for testing purposes, but in production
 * we use applyRedirectProtection from src/utils/dnr.js
 */
export function extractMainFrameBlockingConditions(dnrRules) {
  const conditions = [];

  for (const rule of dnrRules) {
    // Only process blocking rules
    if (rule.action.type !== 'block') continue;

    // Only process rules that include main_frame
    const resourceTypes = rule.condition.resourceTypes || [];
    if (!resourceTypes.includes('main_frame')) continue;

    // Copy the entire condition, but filter resourceTypes to only main_frame
    const condition = {
      ...rule.condition,
      resourceTypes: ['main_frame'],
    };

    conditions.push(condition);
  }

  return conditions;
}

async function main() {
  console.log('[redirect-protection] Building redirect protection rules...\n');

  if (!existsSync(RESOURCES_PATH)) {
    console.error(`Error: Resources directory not found at ${RESOURCES_PATH}`);
    console.error('Please run "npm run download-dnr-rulesets" first.');
    process.exit(1);
  }

  // Only use ads and tracking rulesets as the base for redirect protection
  const TARGET_RULESETS = ['dnr-ads.json', 'dnr-tracking.json'];
  const files = TARGET_RULESETS.filter((f) =>
    existsSync(`${RESOURCES_PATH}/${f}`),
  );

  if (files.length === 0) {
    console.error(
      'Error: Required DNR ruleset files not found (dnr-ads.json, dnr-tracking.json).',
    );
    console.error('Please run "npm run download-dnr-rulesets" first.');
    process.exit(1);
  }

  console.log(
    `Using ${files.length} DNR ruleset files for redirect protection:`,
  );
  files.forEach((f) => console.log(`  - ${f}`));
  console.log('');

  const allBlockingRules = [];
  let totalRulesProcessed = 0;
  let totalBlockingRules = 0;

  // Process each ruleset file - extract only blocking rules
  for (const file of files) {
    const filePath = `${RESOURCES_PATH}/${file}`;
    const content = readFileSync(filePath, 'utf-8');
    const rules = JSON.parse(content);

    totalRulesProcessed += rules.length;

    // Filter to only blocking rules
    const blockingRules = rules.filter((rule) => rule.action?.type === 'block');
    totalBlockingRules += blockingRules.length;

    console.log(
      `Processed ${file}: ${rules.length} total rules, ${blockingRules.length} blocking rules`,
    );

    allBlockingRules.push(...blockingRules);
  }

  console.log(`\nSummary:`);
  console.log(`  Total rules processed: ${totalRulesProcessed}`);
  console.log(`  Total blocking rules: ${totalBlockingRules}`);

  // Apply redirect protection to blocking rules
  // This converts main_frame blocking rules to redirect rules
  const redirectRulesWithoutIds = applyRedirectProtection(allBlockingRules, {
    enabled: true,
    priority: 100,
  }).filter((rule) => rule.action.type === 'redirect');

  // Add IDs to redirect rules
  const redirectRules = redirectRulesWithoutIds.map((rule, index) => ({
    ...rule,
    id: index + 1,
  }));

  console.log(`\nGenerated ${redirectRules.length} redirect rules`);

  // Save to file
  const outputPath = `${RESOURCES_PATH}/dnr-redirect-protection.json`;
  writeFileSync(outputPath, JSON.stringify(redirectRules, null, 2));

  const fileSize = (readFileSync(outputPath).length / 1024).toFixed(2);
  console.log(`\nSaved redirect protection rules to ${outputPath}`);
  console.log(`File size: ${fileSize} KB`);

  console.log('\n✅ Redirect protection rules built successfully!');
}

main().catch((error) => {
  console.error('Error building redirect protection rules:', error);
  process.exit(1);
});
