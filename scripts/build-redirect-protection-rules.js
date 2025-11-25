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
import { parse as parseDomain } from 'tldts-experimental';
import { RESOURCES_PATH } from './utils/urls.js';

/**
 * Parse domain from DNR urlFilter pattern
 * Only extracts valid domain patterns like "||example.com^"
 */
function parseUrlFilterDomain(urlFilter) {
  if (!urlFilter) return null;

  // Only process domain patterns (start with || and end with ^)
  if (!urlFilter.startsWith('||') || !urlFilter.endsWith('^')) {
    return null;
  }

  // Extract domain between || and ^
  let domain = urlFilter.substring(2, urlFilter.length - 1);

  // Validate it's a valid domain using tldts
  const parsed = parseDomain(domain);

  // Must have a valid domain and TLD
  if (parsed.domain && parsed.publicSuffix) {
    return parsed.hostname?.toLowerCase() || parsed.domain.toLowerCase();
  }

  return null;
}

/**
 * Extract domains that block main_frame from DNR rules
 */
function extractMainFrameBlockingDomains(dnrRules) {
  const domains = new Set();

  for (const rule of dnrRules) {
    // Only process blocking rules
    if (rule.action.type !== 'block') continue;

    // Only process rules that include main_frame
    const resourceTypes = rule.condition.resourceTypes || [];
    if (!resourceTypes.includes('main_frame')) continue;

    // Extract from requestDomains
    if (rule.condition.requestDomains) {
      rule.condition.requestDomains.forEach((d) =>
        domains.add(d.toLowerCase()),
      );
    }

    // Extract from urlFilter
    if (rule.condition.urlFilter) {
      const domain = parseUrlFilterDomain(rule.condition.urlFilter);
      if (domain) {
        domains.add(domain);
      }
    }
  }

  return Array.from(domains).sort();
}

/**
 * Chunk an array of domains into groups of specified size
 */
function chunkDomains(domains, chunkSize = 1000) {
  const chunks = [];
  for (let i = 0; i < domains.length; i += chunkSize) {
    chunks.push(domains.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Generate redirect DNR rules from domain chunks
 */
function generateRedirectRules(domainChunks, startId = 1) {
  const rules = [];
  let id = startId;

  for (const chunk of domainChunks) {
    rules.push({
      id: id++,
      priority: 100, // Lower than exception rules (which will be priority 200)
      action: {
        type: 'redirect',
        redirect: {
          extensionPath: '/pages/redirect-protection/index.html',
        },
      },
      condition: {
        requestDomains: chunk,
        resourceTypes: ['main_frame'],
      },
    });
  }

  return rules;
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

  const allDomains = new Set();
  let totalRulesProcessed = 0;
  let totalMainFrameRules = 0;
  let totalValidDomains = 0;

  // Process each ruleset file
  for (const file of files) {
    const filePath = `${RESOURCES_PATH}/${file}`;
    const content = readFileSync(filePath, 'utf-8');
    const rules = JSON.parse(content);

    const domains = extractMainFrameBlockingDomains(rules);
    totalRulesProcessed += rules.length;

    // Count main_frame blocking rules for stats
    const mainFrameRules = rules.filter(
      (r) =>
        r.action.type === 'block' &&
        r.condition.resourceTypes?.includes('main_frame'),
    );
    totalMainFrameRules += mainFrameRules.length;
    totalValidDomains += domains.length;

    console.log(
      `Processed ${file}: ${rules.length} total rules, ${mainFrameRules.length} main_frame rules, ${domains.length} valid domains extracted`,
    );

    domains.forEach((d) => allDomains.add(d));
  }

  console.log(`\nSummary:`);
  console.log(`  Total rules processed: ${totalRulesProcessed}`);
  console.log(`  Total main_frame blocking rules: ${totalMainFrameRules}`);
  console.log(`  Total valid domains extracted: ${totalValidDomains}`);
  console.log(`  Total unique domains: ${allDomains.size}`);

  // Chunk domains for DNR rules (max 1000 domains per rule)
  const domainArray = Array.from(allDomains).sort();
  const domainChunks = chunkDomains(domainArray);

  console.log(`Domain chunks created: ${domainChunks.length}`);

  // Generate redirect rules
  const redirectRules = generateRedirectRules(domainChunks);

  console.log(`\nGenerated ${redirectRules.length} redirect rules`);

  // Save to file
  const outputPath = `${RESOURCES_PATH}/dnr-redirect-protection.json`;
  writeFileSync(outputPath, JSON.stringify(redirectRules, null, 2));

  const fileSize = (readFileSync(outputPath).length / 1024).toFixed(2);
  console.log(`\nSaved redirect protection rules to ${outputPath}`);
  console.log(`File size: ${fileSize} KB`);

  // Show some sample domains
  console.log(`\nSample domains (first 10):`);
  domainArray.slice(0, 10).forEach((d) => console.log(`  - ${d}`));

  console.log('\n✅ Redirect protection rules built successfully!');
}

main().catch((error) => {
  console.error('Error building redirect protection rules:', error);
  process.exit(1);
});
