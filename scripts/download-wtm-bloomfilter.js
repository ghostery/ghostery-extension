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

import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = 'https://cdn.ghostery.com/antitracking/whitelist/2';
const TARGET_PATH = resolve('src/rule_resources/whotracksme');

rmSync(TARGET_PATH, { recursive: true, force: true });
mkdirSync(TARGET_PATH, { recursive: true });

const update = await fetch(`${BASE_URL}/update.json.gz`).then((res) => {
  if (!res.ok) {
    throw new Error(
      `Failed to download update.json": ${res.status}: ${res.statusText}`,
    );
  }

  return res.json();
});

writeFileSync(`${TARGET_PATH}/update.json`, JSON.stringify(update));

const bloomfitler = await fetch(
  `${BASE_URL}/${update.version}/bloom_filter.gz`,
).then((res) => {
  if (!res.ok) {
    throw new Error(
      `Failed to download bloom_filter.gz": ${res.status}: ${res.statusText}`,
    );
  }

  return res.arrayBuffer();
});

writeFileSync(`${TARGET_PATH}/bloom_filter.dat`, new Uint8Array(bloomfitler));
