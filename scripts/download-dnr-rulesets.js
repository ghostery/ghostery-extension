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

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

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

async function downloadRuleset(name, outputPath, metadataPath) {
  const list = await fetch(
    `https://${CDN_HOSTNAME}/adblocker/configs/${name}/allowed-lists.json`,
  ).then(handleResponse);

  const prems = [];
  if (list.dnr) {
    prems.push(fetch(list.dnr.url || list.dnr.network).then(handleResponse));

    // Only download metadata when the ruleset is available
    if (list.dnr.metadataUrl) {
      prems.push(fetch(list.dnr.metadataUrl).then(handleResponse));
    }
  }

  const [dnr, metadata] = await Promise.all(prems);

  if (dnr) {
    writeFileSync(outputPath, JSON.stringify(dnr, null, 2));
  }
  if (metadata && Object.keys(metadata).length !== 0) {
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  // Group the freshly downloaded ruleset in place so the optimization
  // is persisted in src/rule_resources and does not need to run on every build.
  groupRulesetFile(outputPath);

  return name;
}

const isTTY = process.stdout.isTTY && typeof process.stdout.cursorTo === 'function';

function clearLine() {
  if (!isTTY) return;

  process.stdout.cursorTo(0);
  process.stdout.clearLine(0);
}

function createProgress() {
  let total = 0;
  let success = 0;
  let error = 0;

  return {
    getResult() {
      return {
        success,
        error,
      };
    },
    setTotal(count) {
      total = count;
    },
    tick(isError) {
      if (isError) {
        error += 1;
      } else {
        success += 1;
      }

      if (!isTTY || success + error >= total) {
        return;
      }

      clearLine();
      process.stdout.write(`Downloading ${total - (success + error)} DNR rulesets...`);
    },
  };
}

const progress = createProgress();
const prems = Object.entries(RULESETS).reduce(function (prems, [name, target]) {
  const outputPath = `${RESOURCES_PATH}/dnr-${target}.json`;
  const metadataPath = `${RESOURCES_PATH}/dnr-${target}.metadata.json`;

  if (existsSync(outputPath)) {
    return prems;
  }

  prems.push(
    downloadRuleset(name, outputPath, metadataPath)
      .then(function () {
        clearLine();
        console.log(`Downloaded DNR ruleset for "${name}"`);
        progress.tick();
      })
      .catch(function (e) {
        clearLine();
        console.error(`Error: Failed to DNR ruleset for "${name}"!`, e);
        progress.tick(true);
        return e;
      }),
  );

  return prems;
}, []);

progress.setTotal(prems.length);

if (isTTY) {
  process.stdout.write(`Downloading ${prems.length} DNR rulesets...`);
} else {
  console.log(`Downloading ${prems.length} DNR rulesets...`);
}

Promise.all(prems).then(function () {
  clearLine();

  const { success, error } = progress.getResult();
  if (error > 0) {
    console.log(`Downloaded ${success} DNR rulesets with ${error} errors!`);
    process.exit(1);
  }

  console.log(`Downloaded ${success} DNR rulesets`);
});
