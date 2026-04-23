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

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

import REGIONS from '../src/utils/regions.js';
import { CDN_HOSTNAME, RESOURCES_PATH } from './utils/urls.js';
import { groupRulesetFile } from './group-dnr-rulesets.js';

if (!existsSync(RESOURCES_PATH)) {
  mkdirSync(RESOURCES_PATH, { recursive: true });
}

const RULESETS = {
  'dnr-ads-v2': 'ads',
  'dnr-tracking-v2': 'tracking',
  'dnr-annoyances-v2': 'annoyances',
  'dnr-fixes-v2': 'fixes',
  ...REGIONS.reduce((acc, region) => {
    acc[`dnr-lang-${region}-v2`] = `lang-${region}`;
    return acc;
  }, {}),
};

/**
 * @param {Response} res
 */
function handleResponse(res) {
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.url} ${res.status}`);
  }
  return res.json();
}

for (const [name, target] of Object.entries(RULESETS)) {
  const outputPath = `${RESOURCES_PATH}/dnr-${target}.json`;
  const metadataPath = `${RESOURCES_PATH}/dnr-${target}.metadata.json`;

  if (existsSync(outputPath)) {
    continue;
  }

  if (process.stdout.isTTY) process.stdout.clearLine(1);
  process.stdout.write(`Downloading DNR ruleset for "${name}"...`);

  const list = await fetch(
    `https://${CDN_HOSTNAME}/adblocker/configs/${name}/allowed-lists.json`,
  ).then(handleResponse);

  /* DNR rules */

  if (list.dnr) {
    const dnr = await fetch(list.dnr.url || list.dnr.network).then(handleResponse);

    writeFileSync(outputPath, JSON.stringify(dnr, null, 2));

    if (list.dnr.metadataUrl) {
      const metadata = await fetch(list.dnr.metadataUrl).then(handleResponse);

      if (Object.keys(metadata).length !== 0) {
        writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      }
    }

    // Group the freshly downloaded ruleset in place so the optimization
    // is persisted in src/rule_resources and does not need to run on every build.
    groupRulesetFile(outputPath);

    process.stdout.write(' done\n');
  }
}
