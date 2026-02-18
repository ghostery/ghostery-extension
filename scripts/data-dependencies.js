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

import { CDN_HOSTNAME, WTM_BASE_URL } from './utils/urls.js';

const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));

console.log('Updating data dependencies...');

// wtm-stats
packageJson.dataDependencies['wtm-stats'] = await fetch(
  'https://api.github.com/repos/whotracksme/whotracks.me/commits?per_page=1',
  { headers: { 'Accept': 'application/vnd.github.v3+json' } },
)
  .then((res) => res.json())
  .then((data) => data[0].sha);

// wtm-bloomfilter
const wtmUpdateConfig = await fetch(`${WTM_BASE_URL}/update.json.gz`).then((res) => {
  if (!res.ok) {
    throw new Error(`Failed to download update.json": ${res.status}: ${res.statusText}`);
  }

  return res.json();
});

packageJson.dataDependencies['wtm-bloomfilter'] = wtmUpdateConfig.version;

// redirect-resources
const redirectResourcesRevision = await fetch(
  `https://${CDN_HOSTNAME}/adblocker/resources/ublock-resources-json/metadata.json`,
)
  .then((res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to download allowed list for "ublock-resources-json": ${res.status}: ${res.statusText}`,
      );
    }

    return res.json();
  })
  .then((data) => data.revisions.at(-1));

if (!redirectResourcesRevision) {
  throw new Error('No revisions found for "ublock-resources-json"');
}

packageJson.dataDependencies['redirect-resources'] = redirectResourcesRevision;

//
// Save the updated package.json
//

writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
