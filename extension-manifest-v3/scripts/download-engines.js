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

    const supportedActions = [
      'block',
      'allow',
      'upgradeScheme',
      'allowAllRequests',
      'redirect',
    ];

    const supportedResourceTypes = [
      'font',
      'image',
      'main_frame',
      'media',
      'ping',
      'script',
      'stylesheet',
      'sub_frame',
      'websocket',
      'xmlhttprequest',
      'other',
    ];

    const rules = [];
    for (const rule of JSON.parse(dnr)) {
      if (
        !supportedActions.includes(rule.action.type) ||
        // Based on https://github.com/w3c/webextensions/issues/344#issuecomment-1430358116
        rule.condition.regexFilter?.match(/(\{\d*,\d*\}|\{\d\}|\|)/) ||
        rule.condition.requestDomains
      ) {
        continue;
      }

      const compatRule = {
        priority: rule.priority,
        ...(rule.action.type === 'allowAllRequests'
          ? {
              action: { type: 'allow' },
              condition: {
                domains: rule.condition.requestDomains?.map((d) => `*${d}`),
                regexFilter: '.*',
              },
            }
          : {
              action: rule.action,
              condition: {
                isUrlFilterCaseSensitive:
                  rule.condition.isUrlFilterCaseSensitive || false,
                domainType: rule.condition.domainType,
                resourceTypes: rule.condition.resourceTypes?.filter((type) =>
                  supportedResourceTypes.includes(type),
                ),
                domains: rule.condition.initiatorDomains?.map((d) => `*${d}`),
                excludedDomains: rule.condition.excludedInitiatorDomains?.map(
                  (d) => `*${d}`,
                ),
                urlFilter:
                  rule.action.type === 'redirect' &&
                  rule.condition.urlFilter?.startsWith('||')
                    ? rule.condition.urlFilter.slice(2)
                    : rule.condition.urlFilter,
                regexFilter:
                  rule.condition.regexFilter || !rule.condition.urlFilter
                    ? '.*'
                    : undefined,
              },
            }),
      };

      if (compatRule.condition.resourceTypes?.length === 0) {
        continue;
      }

      compatRule.id = rules.length + 1;
      rules.push(compatRule);
    }

    writeFileSync(
      `${TARGET_PATH}/dnr-safari-${target}.json`,
      JSON.stringify(rules, null, 2),
    );
  }
}
