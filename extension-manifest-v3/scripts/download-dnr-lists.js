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

import shelljs from 'shelljs';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const REPO_URL = 'git@github.com:ghostery/ghostery-dnr-lists.git';
const TARGET_PATH = resolve('src/rule_resources');

shelljs.rm('-rf', 'tmp');
shelljs.rm('-rf', TARGET_PATH);
shelljs.mkdir('-p', TARGET_PATH);

function writeJSONPlaceholder(path, content) {
  writeFileSync(resolve(TARGET_PATH, path), JSON.stringify(content));
}

try {
  const result = shelljs.exec(`git clone ${REPO_URL} tmp/dnr-lists`);
  if (result.code !== 0) {
    throw Error("Couldn't clone repo");
  }

  shelljs.exec('cd tmp/dnr-lists && npm ci && npm start');

  shelljs.cp('-R', 'tmp/dnr-lists/build/*.json', TARGET_PATH);
} catch (e) {
  console.log('Generating placeholder DNR lists');

  writeJSONPlaceholder('dnr-ads-network.json', []);
  writeJSONPlaceholder('dnr-annoyances-network.json', []);
  writeJSONPlaceholder('dnr-tracking-network.json', []);

  writeJSONPlaceholder('dnr-safari-ads-network.json', []);
  writeJSONPlaceholder('dnr-safari-annoyances-network.json', []);
  writeJSONPlaceholder('dnr-safari-tracking-network.json', []);
} finally {
  shelljs.rm('-rf', 'tmp');
}
