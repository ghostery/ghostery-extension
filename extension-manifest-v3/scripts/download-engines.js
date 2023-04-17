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

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import fetch from 'node-fetch';
import shelljs from 'shelljs';

import { ENGINE_VERSION } from '@cliqz/adblocker';

const ENGINES = {
  'dnr-ads': 'ads',
  'dnr-tracking': 'tracking',
  'dnr-annoyances': 'annoyances',
  'dnr-cosmetics-ads': 'ads-cosmetics',
  'dnr-cosmetics-tracking': 'tracking-cosmetics',
  'dnr-cosmetics-annoyances': 'annoyances-cosmetics',
  'trackerdbMv3': 'trackerdb',
};

const TARGET_PATH = resolve('src/rule_resources');

shelljs.rm('-rf', TARGET_PATH);
shelljs.mkdir('-p', TARGET_PATH);

for (const [name, target] of Object.entries(ENGINES)) {
  console.log(`Downloading "${name}"...`);

  const list = await fetch(
    `https://cdn.ghostery.com/adblocker/configs/${name}/allowed-lists.json`,
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

  writeFileSync(`${TARGET_PATH}/engine-${target}.bytes`, new Uint8Array(rules));

  /* DNR rules */
  if (list.dnr) {
    const dnr = await fetch(list.dnr.network).then((res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to fetch DNR rules for "${name}": ${res.status}: ${res.statusText}`,
        );
      }

      return res.text();
    });

    writeFileSync(`${TARGET_PATH}/dnr-${target}.json`, dnr);

    // Based on https://github.com/w3c/webextensions/issues/344#issuecomment-1430358116
    const safariDnr = JSON.parse(dnr).filter((rule) => {
      if (
        rule.action?.type === 'modifyHeaders' ||
        rule.condition?.regexFilter?.match(/(\{\d*,\d*\}|\{\d\}|\|)/)
      ) {
        return false;
      }

      return true;
    });

    writeFileSync(
      `${TARGET_PATH}/dnr-safari-${target}.json`,
      JSON.stringify(safariDnr, null, 2),
    );
  }
}
