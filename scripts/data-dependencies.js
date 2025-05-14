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

import { readFileSync, writeFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));

console.log('Updating data dependencies...');

// wtm-stats
packageJson.dataDependencies['wtm-stats'] = await fetch(
  'https://api.github.com/repos/whotracksme/whotracks.me/commits?per_page=1',
  { headers: { 'Accept': 'application/vnd.github.v3+json' } },
)
  .then((res) => res.json())
  .then((data) => data[0].sha);

// Save the updated package.json
writeFileSync(
  'package.json',
  JSON.stringify(packageJson, null, 2) + '\n',
  'utf-8',
);
