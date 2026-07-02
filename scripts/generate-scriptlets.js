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

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import scriptlets from '@ghostery/scriptlets';

import { generateScriptletsModule } from './utils/scriptlets-module.js';

const debug = process.argv.includes('--debug');

writeFileSync(
  resolve('src/background/adblocker/scriptlets.generated.js'),
  generateScriptletsModule(scriptlets, { debug }),
);

console.log(
  `Generated scriptlets.generated.js (${Object.keys(scriptlets).length} scriptlets${
    debug ? ' + e2e test scriptlet' : ''
  })`,
);
