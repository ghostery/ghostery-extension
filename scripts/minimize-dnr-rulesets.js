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

import {
  readdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  existsSync,
} from 'node:fs';
import { join } from 'node:path';

import { RESOURCES_PATH } from './utils/urls.js';

// Matches bare domain urlFilter patterns like ||example.com^
// Excludes IP addresses and single-label domains.
const BARE_DOMAIN = /^\|\|([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)\^$/;

const MAX_DOMAINS_PER_RULE = 1000;
const RULES_PER_CHUNK = 10000;
const SPLIT_RULESETS = new Set(['dnr-ads']);

function loadMetadata(basePath) {
  const metaPath = basePath.replace('.json', '.metadata.json');
  if (!existsSync(metaPath)) return new Map();
  const raw = JSON.parse(readFileSync(metaPath, 'utf-8'));
  return new Map(Object.entries(raw).map(([id, v]) => [Number(id), v]));
}

function writeRuleset(filePath, rules, metadata) {
  const idMap = new Map();
  const renumbered = rules.map((rule, i) => {
    const newId = i + 1;
    idMap.set(rule.id, newId);
    return { ...rule, id: newId };
  });

  writeFileSync(filePath, JSON.stringify(renumbered));

  const metaPath = filePath.replace('.json', '.metadata.json');
  const metaOut = {};
  for (const rule of rules) {
    if (metadata.has(rule.id)) {
      metaOut[idMap.get(rule.id)] = metadata.get(rule.id);
    }
  }
  if (Object.keys(metaOut).length > 0) {
    writeFileSync(metaPath, JSON.stringify(metaOut));
  }

  return renumbered;
}

function splitRuleset(filePath, baseName, rules, metadata) {
  const metaIds = new Set(metadata.keys());

  const domainGroups = new Map();
  const otherRules = [];

  for (const rule of rules) {
    if (metaIds.has(rule.id)) {
      otherRules.push(rule);
      continue;
    }

    const match = rule.condition?.urlFilter && BARE_DOMAIN.exec(rule.condition.urlFilter);
    if (!match) {
      otherRules.push(rule);
      continue;
    }

    const domain = match[1];
    const condRest = { ...rule.condition };
    delete condRest.urlFilter;
    const key = JSON.stringify({ action: rule.action, priority: rule.priority, condRest });

    if (!domainGroups.has(key)) {
      domainGroups.set(key, { action: rule.action, priority: rule.priority, condRest, domains: [] });
    }
    domainGroups.get(key).domains.push(domain);
  }

  const domainRules = [];
  let nextId = 1;
  for (const { action, priority, condRest, domains } of domainGroups.values()) {
    domains.sort();
    for (let i = 0; i < domains.length; i += MAX_DOMAINS_PER_RULE) {
      domainRules.push({
        id: nextId++,
        action,
        condition: { ...condRest, requestDomains: domains.slice(i, i + MAX_DOMAINS_PER_RULE) },
        priority,
      });
    }
  }

  const dir = filePath.replace(/[^/]+$/, '');
  let totalRules = 0;
  let totalBytes = 0;

  const domainsPath = join(dir, `${baseName}-domains.json`);
  writeFileSync(domainsPath, JSON.stringify(domainRules));
  totalRules += domainRules.length;
  totalBytes += Buffer.byteLength(JSON.stringify(domainRules), 'utf-8');
  console.log(`    ${baseName}-domains.json: ${domainRules.length} rules (${domainRules.reduce((s, r) => s + (r.condition.requestDomains?.length || 0), 0)} domains)`);

  for (let i = 0; i < otherRules.length; i += RULES_PER_CHUNK) {
    const chunk = otherRules.slice(i, i + RULES_PER_CHUNK);
    const chunkIndex = Math.floor(i / RULES_PER_CHUNK);
    const chunkPath = join(dir, `${baseName}-${chunkIndex}.json`);
    const written = writeRuleset(chunkPath, chunk, metadata);
    totalRules += written.length;
    totalBytes += Buffer.byteLength(JSON.stringify(written), 'utf-8');
    console.log(`    ${baseName}-${chunkIndex}.json: ${written.length} rules`);
  }

  unlinkSync(filePath);
  const metaPath = filePath.replace('.json', '.metadata.json');
  if (existsSync(metaPath)) unlinkSync(metaPath);

  return { totalRules, totalBytes };
}

function minimizeRuleset(rules) {
  const groups = new Map();
  const out = [];

  for (const rule of rules) {
    const match = rule.condition?.urlFilter && BARE_DOMAIN.exec(rule.condition.urlFilter);
    if (!match) {
      out.push(rule);
      continue;
    }

    const domain = match[1];
    const condRest = { ...rule.condition };
    delete condRest.urlFilter;
    const key = JSON.stringify({ action: rule.action, priority: rule.priority, condRest });

    if (!groups.has(key)) {
      groups.set(key, { action: rule.action, priority: rule.priority, condRest, domains: [] });
    }
    groups.get(key).domains.push(domain);
  }

  let nextId = out.reduce((max, r) => Math.max(max, r.id || 0), 0) + 1;
  for (const { action, priority, condRest, domains } of groups.values()) {
    domains.sort();
    for (let i = 0; i < domains.length; i += MAX_DOMAINS_PER_RULE) {
      out.push({
        id: nextId++,
        action,
        condition: { ...condRest, requestDomains: domains.slice(i, i + MAX_DOMAINS_PER_RULE) },
        priority,
      });
    }
  }

  return out;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

if (!existsSync(RESOURCES_PATH)) {
  console.error(`Error: Resources directory not found at ${RESOURCES_PATH}`);
  process.exit(1);
}

const files = readdirSync(RESOURCES_PATH)
  .filter((f) => f.startsWith('dnr-') && f.endsWith('.json') && !f.endsWith('.metadata.json'))
  .sort();

let totalBefore = 0;
let totalAfter = 0;
let processedCount = 0;

for (const file of files) {
  const filePath = join(RESOURCES_PATH, file);
  const original = readFileSync(filePath, 'utf-8');

  if (!original.startsWith('[\n')) continue;

  let rules;
  try {
    rules = JSON.parse(original);
  } catch (e) {
    console.error(`  ${file}: failed to parse, skipping (${e.message})`);
    continue;
  }

  if (!Array.isArray(rules) || rules.length === 0) {
    writeFileSync(filePath, JSON.stringify(rules));
    continue;
  }

  const beforeBytes = Buffer.byteLength(original, 'utf-8');
  const beforeCount = rules.length;
  const baseName = file.replace('.json', '');

  if (SPLIT_RULESETS.has(baseName)) {
    console.log(`  ${file}: ${beforeCount} rules → splitting...`);
    const metadata = loadMetadata(filePath);
    const { totalRules, totalBytes } = splitRuleset(filePath, baseName, rules, metadata);
    totalBefore += beforeBytes;
    totalAfter += totalBytes;
    processedCount += 1;
    const sizePct = ((1 - totalBytes / beforeBytes) * 100).toFixed(1);
    console.log(`  ${file}: ${beforeCount} → ${totalRules} rules, ${formatBytes(beforeBytes)} → ${formatBytes(totalBytes)} (-${sizePct}%)`);
  } else {
    const minimized = minimizeRuleset(rules);
    const minimizedJson = JSON.stringify(minimized);
    writeFileSync(filePath, minimizedJson);

    const afterBytes = Buffer.byteLength(minimizedJson, 'utf-8');
    totalBefore += beforeBytes;
    totalAfter += afterBytes;
    processedCount += 1;

    const sizePct = ((1 - afterBytes / beforeBytes) * 100).toFixed(1);
    console.log(
      `  ${file}: ${beforeCount} → ${minimized.length} rules, ${formatBytes(beforeBytes)} → ${formatBytes(afterBytes)} (-${sizePct}%)`,
    );
  }
}

if (processedCount > 0) {
  const totalPct = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
  console.log(
    `Minimized ${processedCount} ruleset(s): ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)} (-${totalPct}%)`,
  );
}
