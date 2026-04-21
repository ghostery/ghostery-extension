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
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const binPath = resolve(import.meta.dirname, 'bin', 'validate-dnr-rules');
const rulesDir = resolve(process.cwd(), 'dist', 'rule_resources');

if (!existsSync(binPath)) {
  console.error(
    `[filter-invalid-dnr-rules] Validator binary not found at ${binPath}.\n` +
      `Run 'npm install' to download it from https://github.com/ghostery/WebKit/releases.`,
  );
  process.exit(1);
}

if (!existsSync(rulesDir)) {
  console.error(`[filter-invalid-dnr-rules] Rules directory not found: ${rulesDir}`);
  process.exit(1);
}

const files = readdirSync(rulesDir)
  .filter((f) => f.startsWith('dnr-') && f.endsWith('.json') && !f.endsWith('.metadata.json'))
  .map((f) => join(rulesDir, f));

const ERROR_RE = /^\s*ERROR: Rule (-?\d+)/gm;

let totalRemoved = 0;

for (const file of files) {
  const result = spawnSync(binPath, [file], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });

  if (result.error) {
    console.error(`[filter-invalid-dnr-rules] Failed to spawn validator: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status === 0) {
    continue;
  }

  const invalidIds = new Set();
  for (const m of result.stdout.matchAll(ERROR_RE)) {
    invalidIds.add(Number(m[1]));
  }

  if (invalidIds.size === 0) {
    console.error(
      `[filter-invalid-dnr-rules] Validator failed for ${file} but produced no parseable errors:\n${result.stdout}${result.stderr}`,
    );
    process.exit(1);
  }

  const rules = JSON.parse(readFileSync(file, 'utf8'));
  const filtered = rules.filter((r) => !invalidIds.has(r.id));
  const removed = rules.length - filtered.length;

  writeFileSync(file, JSON.stringify(filtered));
  totalRemoved += removed;

  console.log(
    `[filter-invalid-dnr-rules] ${relative(process.cwd(), file)}: removed ${removed}/${rules.length} invalid rule(s)`,
  );
}

console.log(
  `[filter-invalid-dnr-rules] Removed ${totalRemoved} rule(s) across ${files.length} ruleset(s).`,
);
