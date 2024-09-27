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

import { ENGINE_VERSION, FiltersEngine } from '@cliqz/adblocker';
import REGIONS from '../src/utils/regions.js';

function createChecksum(content) {
  return createHash('sha256').update(content).digest('hex');
}

function isChecksumMatched(path, checksum) {
  if (existsSync(path) && createChecksum(readFileSync(path)) === checksum) {
    if (process.stdout.isTTY) {
      process.stdout.write('\r');
      process.stdout.clearLine(1);
    }

    return true;
  }

  return false;
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
const CDN_HOSTNAME = process.argv.includes('--staging')
  ? 'staging-cdn.ghostery.com'
  : 'cdn.ghostery.com';

console.log(`Downloading engines from ${CDN_HOSTNAME}...`);

shelljs.mkdir('-p', TARGET_PATH);

for (const [name, target] of Object.entries(ENGINES)) {
  process.stdout.write(`Downloading "${name}"...`);

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

  if (isChecksumMatched(outputPath, engine.checksum)) {
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
  process.stdout.write(' done\n');
}

const DNR = {
  'dnr-ads': 'ads',
  'dnr-tracking': 'tracking',
  'dnr-annoyances': 'annoyances',
  'dnr-ios': 'safari',
  'dnr-fixes': 'fixes',
  'dnr-fixes-safari': 'fixes-safari',
  ...REGIONAL_ENGINES,
};

for (const [name, target] of Object.entries(DNR)) {
  if (process.stdout.isTTY) process.stdout.clearLine(1);
  process.stdout.write(`Downloading DNR ruleset for "${name}"...`);

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

    if (isChecksumMatched(outputPath, list.dnr.checksum)) {
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
    process.stdout.write(' done\n');
  }
}

// Extract resources from ads engine
console.log('Extracting resources...');

shelljs.mkdir('-p', resolve(TARGET_PATH, 'redirects'));

const seenResource = new Set();
const allowedResourceExtensions = [
  'html',
  'js',
  'css',
  'mp4',
  'mp3',
  'xml',
  'txt',
  'json',
  'png',
  'gif',
  'empty',
];

FiltersEngine.deserialize(
  readFileSync(`${TARGET_PATH}/engine-ads.dat`),
).resources.resources.forEach((value, key) => {
  // refs https://github.com/gorhill/uBlock/tree/master/src/web_accessible_resources
  if (
    value.contentType === 'application/javascript' &&
    (value.body.includes('scriptletGlobals') || // Drop scriptlets
      key.includes('/')) // Drop resources within a directory
  ) {
    return;
  }

  if (
    !allowedResourceExtensions.includes(key.split('.').pop()) // Drop resources with an unknown file extension
  ) {
    return;
  }

  if (seenResource.has(value.body)) {
    return;
  }

  seenResource.add(value.body);

  // Decode base64
  if (value.contentType.endsWith(';base64')) {
    value.body = Buffer.from(value.body, 'base64').toString('binary');
  }

  writeFileSync(resolve(TARGET_PATH, 'redirects', key), value.body);
});
