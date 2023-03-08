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

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import fetch from 'node-fetch';
import shelljs from 'shelljs';

import { ENGINE_VERSION } from '@cliqz/adblocker';

const ENGINES = {
  'dnr-ads': 'full/ads',
  'dnr-tracking': 'full/tracking',
  'dnr-annoyances': 'full/annoyances',
  'dnr-cosmetics-ads': 'cosmetics/ads',
  'dnr-cosmetics-tracking': 'cosmetics/tracking',
  'dnr-cosmetics-annoyances': 'cosmetics/annoyances',
  'trackerdbMv3': 'trackerdb',
};

const TARGET_PATH = resolve('src/adblocker_engines');

shelljs.rm('-rf', TARGET_PATH);

for (const [name, path] of Object.entries(ENGINES)) {
  console.log(`Downloading "${name}"...`);

  const list = await fetch(
    `https://cdn.ghostery.com/adblocker/configs/${name}/allowed-lists.json`,
  ).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to download allowed list for "${name}": ${res.status}: ${res.statusText}`,
      );
    }

    return res.json();
  });

  const engine = list.engines[ENGINE_VERSION];

  if (!engine) {
    throw new Error(
      `Engine "${name}" for "${ENGINE_VERSION}" engine version not found`,
    );
  }

  const rules = await fetch(engine.url).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to fetch engine "${name}": ${res.status}: ${res.statusText}`,
      );
    }

    return res.arrayBuffer();
  });

  if (path.includes('/')) {
    shelljs.mkdir('-p', `${TARGET_PATH}/${path.split('/')[0]}`);
  }

  writeFileSync(`${TARGET_PATH}/${path}.engine.bytes`, new Uint8Array(rules));
}
