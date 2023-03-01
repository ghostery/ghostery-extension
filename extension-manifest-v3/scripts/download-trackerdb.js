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
import fetch from 'node-fetch';
import path from 'path';

const response = await fetch(
  'https://github.com/ghostery/trackerdb/releases/latest/download/trackerdb.engine',
)

if (!response.ok) {
  throw new Error(`Failed to load TrackerDB ${response.status}: ${response.statusText}`);
}

const trackerDB = await response.arrayBuffer();

writeFileSync(
  path.join('src', 'assets', 'trackerdb.engine.bytes'),
  new Uint8Array(trackerDB),
);
