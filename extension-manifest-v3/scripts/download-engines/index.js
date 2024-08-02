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

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { resolve } from 'path';
import shelljs from 'shelljs';

import { ENGINE_VERSION } from '@cliqz/adblocker';
import REGIONS from '../../src/utils/regions.js';

function checksum(content) {
  return createHash('sha256').update(content).digest('hex');
}

const REGIONAL_ENGINES = REGIONS.reduce((acc, region) => {
  acc[`dnr-lang-${region}`] = `lang-${region}`;
  return acc;
}, {});
const REGIONAL_COSMETICS_ENGINES = REGIONS.reduce((acc, region) => {
  acc[`dnr-cosmetics-lang-${region}`] = `lang-${region}-cosmetics`;
  return acc;
}, {});

const ENGINES = {
  'dnr-ads': 'ads',
  'dnr-tracking': 'tracking',
  'dnr-annoyances': 'annoyances',
  'dnr-cosmetics-ads': 'ads-cosmetics',
  'dnr-cosmetics-tracking': 'tracking-cosmetics',
  'dnr-cosmetics-annoyances': 'annoyances-cosmetics',
  'dnr-fixes': 'fixes',
  'dnr-cosmetics-fixes': 'fixes-cosmetics',
  'trackerdbMv3': 'trackerdb',
  ...REGIONAL_ENGINES,
  ...REGIONAL_COSMETICS_ENGINES,
};

const TARGET_PATH = resolve('src/rule_resources');

const staging = process.argv.includes('--staging');

const CDN_HOSTNAME = staging ? 'staging-cdn.ghostery.com' : 'cdn.ghostery.com';

shelljs.mkdir('-p', TARGET_PATH);

for (const [name, target] of Object.entries(ENGINES)) {
  console.log(`Downloading "${name}"...`);

  const list = await fetch(
    `https://${CDN_HOSTNAME}/adblocker/configs/${name}/allowed-lists.json`,
  ).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to download allowed list for "${name}": ${res.status}: ${res.statusText}`,
      );
    }

    return res.json();
  });

  /* adblocker serialized engine */

  const engine = list.engines[ENGINE_VERSION];

  if (!engine) {
    throw new Error(
      `Engine "${name}" for "${ENGINE_VERSION}" engine version not found`,
    );
  }

  const outputPath = `${TARGET_PATH}/engine-${target}.dat`;

  if (
    existsSync(outputPath) &&
    checksum(readFileSync(outputPath)) === engine.checksum
  ) {
    console.log('Checksum match - skipping download');
    continue;
  }

  const rules = await fetch(engine.url).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to fetch engine "${name}": ${res.status}: ${res.statusText}`,
      );
    }

    return res.arrayBuffer();
  });

  writeFileSync(outputPath, new Uint8Array(rules));
}

const DNR = {
  'dnr-ads': 'ads',
  'dnr-tracking': 'tracking',
  'dnr-annoyances': 'annoyances',
  'dnr-ios': 'safari',
  'dnr-fixes': 'fixes',
  'dnr-fixes-safari': 'fixes-safari',
  'dnr-trackerdb': 'trackerdb',
  'dnr-trackerdb-safari': 'trackerdb-safari',
  ...REGIONAL_ENGINES,
};

for (const [name, target] of Object.entries(DNR)) {
  console.log(`Downloading DNR ruleset for "${name}"...`);

  const list = await fetch(
    `https://${CDN_HOSTNAME}/adblocker/configs/${name}/allowed-lists.json`,
  ).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to download allowed list for "${name}": ${res.status}: ${res.statusText}`,
      );
    }

    return res.json();
  });

  /* DNR rules */

  if (list.dnr) {
    const outputPath = `${TARGET_PATH}/dnr-${target}.json`;

    if (
      existsSync(outputPath) &&
      checksum(readFileSync(outputPath)) === list.dnr.checksum
    ) {
      console.log('Checksum match - skipping download');
      continue;
    }

    const dnr = await fetch(list.dnr.url || list.dnr.network).then((res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to fetch DNR rules for "${name}": ${res.status}: ${res.statusText}`,
        );
      }

      return res.text();
    });

    writeFileSync(outputPath, dnr);
  }
}
