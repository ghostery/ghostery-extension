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
const DATA_URL =
  'https://raw.githubusercontent.com/whotracksme/whotracks.me/ded8cb4a9bad0fa1fb0b60996382ba6527127c33/whotracksme/data/assets/trackers-preview.json';

if (existsSync(TARGET_PATH)) process.exit(0);

const data = await fetch(DATA_URL).then((res) => {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
});

writeFileSync(
  TARGET_PATH,
  `/**
 * This file is an automatic conversion of a JSON to JavaScipt.
 * Source: https://github.com/whotracksme/whotracks.me/blob/master/whotracksme/data/assets/trackers-preview.json
 * Conversion script: scripts/download-wtm-stats.js
 *
 * Note for AMO reviewers: This is not actual JavaScript code, but a data file.
 */
/**
 * MIT License
 * Copyright (c) 2017 - to present Ghostery GmbH
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
export default ${data};
`,
);

console.log('Trackers preview data downloaded');
