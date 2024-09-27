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

import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const path = resolve(
  process.cwd(),
  './xcode/Ghostery.xcodeproj/project.pbxproj',
);
let file = readFileSync(path, 'utf8');

let [, buildVersion] = file.match(/CURRENT_PROJECT_VERSION = (\d+);/);
buildVersion = Number(buildVersion) + 1;

const { version } = JSON.parse(
  readFileSync(resolve(process.cwd(), './package.json')),
  'utf8',
);

console.log('Bump xcode build version to', buildVersion);
console.log('Update version in xcode project file to', version);

file = file
  .replace(
    /CURRENT_PROJECT_VERSION = (\d+);/g,
    `CURRENT_PROJECT_VERSION = ${buildVersion};`,
  )
  .replace(
    /MARKETING_VERSION = (\d+\.\d+\.\d+);/g,
    `MARKETING_VERSION = ${version};`,
  );

writeFileSync(path, file);
