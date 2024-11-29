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

import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'node:path';

const TARGET_PATH = resolve('src', 'rule_resources', 'wtm-stats.js');
const DATA_URL = 'https://whotracks.me/data/trackers-preview.json';

if (existsSync(TARGET_PATH)) process.exit(0);

const data = await fetch(DATA_URL).then((res) => {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
});

writeFileSync(TARGET_PATH, `export default ${data}`);

console.log('Trackers preview data downloaded');
