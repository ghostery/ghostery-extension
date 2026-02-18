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

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { CDN_HOSTNAME, RESOURCES_PATH } from './utils/urls.js';

const redirectsPath = resolve(RESOURCES_PATH, 'redirects');
if (existsSync(redirectsPath)) process.exit(0);

const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
const revision = packageJson.dataDependencies['redirect-resources'];

console.log(`Downloading redirect resources (${revision})...`);

mkdirSync(redirectsPath, { recursive: true });

const resources = await fetch(
  `https://${CDN_HOSTNAME}/adblocker/resources/ublock-resources-json/${revision}/list.txt`,
).then((res) => {
  if (!res.ok) {
    throw new Error(`Failed to fetch resources: ${res.status}: ${res.statusText}`);
  }

  return res.json();
});

for (const redirect of resources.redirects) {
  const outputPath = resolve(redirectsPath, redirect.name);

  if (redirect.contentType.includes('base64')) {
    writeFileSync(outputPath, Buffer.from(redirect.body, 'base64').toString('binary'));
  } else {
    writeFileSync(outputPath, redirect.body);
  }
}
