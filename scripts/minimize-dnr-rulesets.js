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

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { RESOURCES_PATH } from './utils/urls.js';
import { minimizeRuleset } from './utils/ubo-minimize.js';

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

  // Compact JSON (no leading newline) means we already minimized this file.
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

  const minimized = minimizeRuleset(rules);
  const minimizedJson = JSON.stringify(minimized);
  writeFileSync(filePath, minimizedJson);

  const afterBytes = Buffer.byteLength(minimizedJson, 'utf-8');
  const afterCount = minimized.length;

  totalBefore += beforeBytes;
  totalAfter += afterBytes;
  processedCount += 1;

  const sizePct = ((1 - afterBytes / beforeBytes) * 100).toFixed(1);
  console.log(
    `  ${file}: ${beforeCount} → ${afterCount} rules, ${formatBytes(beforeBytes)} → ${formatBytes(afterBytes)} (-${sizePct}%)`,
  );
}

if (processedCount > 0) {
  const totalPct = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
  console.log(
    `Minimized ${processedCount} ruleset(s): ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)} (-${totalPct}%)`,
  );
}
