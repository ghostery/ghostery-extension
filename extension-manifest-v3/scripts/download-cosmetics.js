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
import { readFile } from 'fs/promises';
import fetch from 'node-fetch';
import { ENGINE_VERSION } from '@cliqz/adblocker';

const pkg = JSON.parse(
  await readFile(new URL('../../package-lock.json', import.meta.url)),
);

const adblockerVersion = pkg.dependencies['@cliqz/adblocker'].version;
const distPath = 'src/assets/adblocker_engines';

// Ad rules
const adList = await fetch(
  'https://cdn.ghostery.com/adblocker/configs/dnr-cosmetics-ads/allowed-lists.json',
).then((res) => res.json());

// Ad Cosmetic rules
const adCosmeticEngineUrl = adList.engines[ENGINE_VERSION].url;

const adCosmeticRules = await fetch(adCosmeticEngineUrl).then((res) =>
  res.arrayBuffer(),
);
writeFileSync(
  `${distPath}/dnr-ads-cosmetics.engine.bytes`,
  new Uint8Array(adCosmeticRules),
);

// Tracking rules

const trackingList = await fetch(
  'https://cdn.ghostery.com/adblocker/configs/dnr-cosmetics-tracking/allowed-lists.json',
).then((res) => res.json());

// Tracking Consmetic rules
const trackingConsmeticEngineUrl = trackingList.engines[ENGINE_VERSION].url;

const trackingCosmeticRules = await (
  await fetch(trackingConsmeticEngineUrl)
).arrayBuffer();
writeFileSync(
  `${distPath}/dnr-tracking-cosmetics.engine.bytes`,
  new Uint8Array(trackingCosmeticRules),
);

// Annoyances rules

const annoyancesList = await fetch(
  'https://cdn.ghostery.com/adblocker/configs/dnr-cosmetics-annoyances/allowed-lists.json',
).then((res) => res.json());

// Tracking Cosmetic rules
const annoyancesCosmeticEngineUrl = annoyancesList.engines[ENGINE_VERSION].url;

const annoyancesCosmeticRules = await fetch(annoyancesCosmeticEngineUrl).then(
  (res) => res.arrayBuffer(),
);

writeFileSync(
  `${distPath}/dnr-annoyances-cosmetics.engine.bytes`,
  new Uint8Array(annoyancesCosmeticRules),
);
