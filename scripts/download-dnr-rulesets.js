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

import REGIONS from '../src/utils/regions.js';

const TARGET_PATH = resolve('src/rule_resources');
const CDN_HOSTNAME = process.argv.includes('--staging')
  ? 'staging-cdn.ghostery.com'
  : 'cdn.ghostery.com';

if (!existsSync(TARGET_PATH)) {
  mkdirSync(TARGET_PATH, { recursive: true });
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

for (const [name, target] of Object.entries(RULESETS)) {
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
