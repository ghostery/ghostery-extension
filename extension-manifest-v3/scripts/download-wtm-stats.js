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
import { URL, fileURLToPath } from 'url';

const DATA_URL = 'https://whotracks.me/data/trackers-preview.json';
const OUTPUT_FILE = fileURLToPath(
  new URL('../src/rule_resources/wtm-stats.js', import.meta.url),
);

const data = await fetch(DATA_URL).then((res) => {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
});

writeFileSync(OUTPUT_FILE, `export default ${data}`);

console.log(
  `Trackers preview data downloaded and saved in "${OUTPUT_FILE.replace(
    process.cwd(),
    '.',
  )}"`,
);
