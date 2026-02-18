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

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { RESOURCES_PATH, WTM_BASE_URL } from './utils/urls.js';

const TARGET_PATH = resolve(RESOURCES_PATH, 'whotracksme');
if (existsSync(TARGET_PATH)) process.exit(0);

const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
const version = packageJson.dataDependencies['wtm-bloomfilter'];

console.log(`Downloading wtm-bloomfilter (${version})...`);

mkdirSync(TARGET_PATH, { recursive: true });

const bloomfilter = await fetch(`${WTM_BASE_URL}/${version}/bloom_filter.gz`).then((res) => {
  if (!res.ok) {
    throw new Error(`Failed to download bloom_filter.gz": ${res.status}: ${res.statusText}`);
  }

  return res.arrayBuffer();
});

writeFileSync(`${TARGET_PATH}/bloom_filter.dat`, new Uint8Array(bloomfilter));

writeFileSync(`${TARGET_PATH}/update.json`, JSON.stringify({ version, useDiff: false }));
