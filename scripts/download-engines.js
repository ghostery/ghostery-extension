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
import { resolve } from 'node:path';

import { ENGINE_VERSION } from '@ghostery/adblocker';
import REGIONS from '../src/utils/regions.js';

const REGIONAL_ENGINES = REGIONS.reduce((acc, region) => {
  acc[`dnr-lang-${region}`] = `lang-${region}`;
  return acc;
}, {});

const ENGINES = {
  'dnr-ads': 'ads',
  'dnr-tracking': 'tracking',
  'dnr-annoyances': 'annoyances',
  'dnr-fixes': 'fixes',
  'trackerdbMv3': 'trackerdb',
  ...REGIONAL_ENGINES,
};

const TARGET_PATH = resolve('src/rule_resources');
const CDN_HOSTNAME = process.argv.includes('--staging')
  ? 'staging-cdn.ghostery.com'
  : 'cdn.ghostery.com';

if (!existsSync(TARGET_PATH)) {
  mkdirSync(TARGET_PATH, { recursive: true });
}

for (const [name, target] of Object.entries(ENGINES)) {
  const outputPath = `${TARGET_PATH}/engine-${target}.dat`;

  if (existsSync(outputPath)) {
    continue;
  }

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
  'dnr-fixes': 'fixes',
  ...REGIONAL_ENGINES,
};

for (const [name, target] of Object.entries(DNR)) {
  const outputPath = `${TARGET_PATH}/dnr-${target}.json`;

  if (existsSync(outputPath)) {
    continue;
  }

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

const redirectsPath = resolve(TARGET_PATH, 'redirects');
if (!existsSync(redirectsPath)) {
  console.log('Downloading redirect resources...');

  mkdirSync(redirectsPath, { recursive: true });

  const { revisions: resourcesRevisions } = await fetch(
    `https://${CDN_HOSTNAME}/adblocker/resources/ublock-resources-json/metadata.json`,
  ).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to download allowed list for "ublock-resources-json": ${res.status}: ${res.statusText}`,
      );
    }

    return res.json();
  });
  const latestResourceRevision = resourcesRevisions.at(-1);

  const resources = await fetch(
    `https://${CDN_HOSTNAME}/adblocker/resources/ublock-resources-json/${latestResourceRevision}/list.txt`,
  ).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to fetch resources: ${res.status}: ${res.statusText}`,
      );
    }

    return res.json();
  });

  for (const redirect of resources.redirects) {
    const outputPath = resolve(redirectsPath, redirect.name);

    if (redirect.contentType.includes('base64')) {
      writeFileSync(
        outputPath,
        Buffer.from(redirect.body, 'base64').toString('binary'),
      );
    } else {
      writeFileSync(outputPath, redirect.body);
    }
  }
}
