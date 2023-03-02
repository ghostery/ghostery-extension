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
import fetch from 'node-fetch';
import shelljs from 'shelljs';

const ENGINES = [
  'dnr-ads',
  'dnr-tracking',
  'dnr-annoyances',
  'dnr-cosmetics-ads',
  'dnr-cosmetics-tracking',
  'dnr-cosmetics-annoyances',
];

const DIST_PATH = 'src/assets/adblocker_engines';

shelljs.rm('-rf', DIST_PATH);
shelljs.mkdir('-p', DIST_PATH);

const adblockerVersion = JSON.parse(
  await readFile(new URL('../../package-lock.json', import.meta.url)),
).dependencies['@cliqz/adblocker'].version;

for (const name of ENGINES) {
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

  writeFileSync(`${DIST_PATH}/${name}.engine.bytes`, new Uint8Array(rules));
}
