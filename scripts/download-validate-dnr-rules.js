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

import { existsSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLATFORM_MAP = {
  'darwin-arm64': 'macos-arm64',
  'darwin-x64': 'macos-arm64',
  'linux-x64': 'linux-x64',
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const binDir = resolve(__dirname, 'bin');
const binPath = resolve(binDir, 'validate-dnr-rules');

const key = `${process.platform}-${process.arch}`;
const suffix = PLATFORM_MAP[key];

if (!suffix) {
  console.log(`[validate-dnr-rules] Skipping download: no binary available for ${key}.`);
  process.exit(0);
}

if (existsSync(binPath)) {
  process.exit(0);
}

const url = `https://github.com/ghostery/WebKit/releases/latest/download/validate-dnr-rules-${suffix}`;

try {
  console.log(`[validate-dnr-rules] Downloading ${url}`);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(binDir, { recursive: true });
  writeFileSync(binPath, buf);
  chmodSync(binPath, 0o755);
  console.log(`[validate-dnr-rules] Saved to ${binPath}`);
} catch (err) {
  console.warn(
    `[validate-dnr-rules] Download failed: ${err.message}. Safari builds will not filter invalid DNR rules until this succeeds.`,
  );
  process.exit(0);
}
