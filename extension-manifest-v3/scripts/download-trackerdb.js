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
import { writeFileSync, readFileSync } from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const pkg = JSON.parse(
  readFileSync(new URL('../../package-lock.json', import.meta.url)),
);

const adblockerVersion = pkg.dependencies['@cliqz/adblocker'].version;

const listResponse = await fetch(
  'https://cdn.ghostery.com/adblocker/configs/trackerdbMv3/allowed-lists.json',
);

if (!listResponse.ok) {
  throw new Error(`Failed to load TrackerDB list ${listResponse.status}: ${listResponse.statusText}`);
}

const list = await listResponse.json();

const trackerDBEngine = Object.values(list.engines).find((e) =>
  e.url.startsWith(
    `https://cdn.ghostery.com/adblocker/engines/${adblockerVersion}`,
  ),
);

const trackerDBResponse = await fetch(trackerDBEngine.url);

if (!trackerDBResponse.ok) {
  throw new Error(`Failed to load TrackerDB ${trackerDBResponse.status}: ${trackerDBResponse.statusText}`);
}

const trackerDB = await trackerDBResponse.arrayBuffer();

writeFileSync(
  path.join('src', 'assets', 'trackerdb.engine.bytes'),
  new Uint8Array(trackerDB),
);
