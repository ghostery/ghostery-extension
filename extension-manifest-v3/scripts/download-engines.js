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
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import fetch from 'node-fetch';
import shelljs from 'shelljs';

const ENGINES = {
  'dnr-ads': 'full/ads',
  'dnr-tracking': 'full/tracking',
  'dnr-annoyances': 'full/annoyances',
  'dnr-cosmetics-ads': 'cosmetics/ads',
  'dnr-cosmetics-tracking': 'cosmetics/tracking',
  'dnr-cosmetics-annoyances': 'cosmetics/annoyances',
};

const TARGET_PATH = resolve('src/adblocker_engines');

shelljs.rm('-rf', TARGET_PATH);

const adblockerVersion = JSON.parse(
  await readFile(new URL('../../package-lock.json', import.meta.url)),
).dependencies['@cliqz/adblocker'].version;

for (const [name, path] of Object.entries(ENGINES)) {
  console.log(`Downloading "${name}" for adblocker ${adblockerVersion}...`);

  const list = await fetch(
    `https://cdn.ghostery.com/adblocker/configs/${name}/allowed-lists.json`,
  ).then((res) => res.json());

  const engine = Object.values(list.engines).find((e) =>
    e.url.startsWith(
      `https://cdn.ghostery.com/adblocker/engines/${adblockerVersion}`,
    ),
  );

  if (!engine) {
    throw new Error(
      `Engine "${name}" for adblocker ${adblockerVersion} not found`,
    );
  }

  const rules = await fetch(engine.url).then((res) => res.arrayBuffer());

  shelljs.mkdir('-p', `${TARGET_PATH}/${path.split('/')[0]}`);
  writeFileSync(`${TARGET_PATH}/${path}.engine.bytes`, new Uint8Array(rules));
}
