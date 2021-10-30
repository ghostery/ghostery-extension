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

const fs = require('fs');
const fetch = require('node-fetch');
const package = require('../package.json');

const adblockerVersion = package.dependencies["@cliqz/adblocker"];

(async () => {
  // Ad rules
  const adList = await (
    await fetch(
      'https://cdn.cliqz.com/adblocker/configs/dnr-cosmetics-ads/allowed-lists.json',
    )
  ).json();

  // Ad Consmetic rules
  const adConsmeticEngine = Object.values(adList.engines).find(e => e.url.startsWith(`https://cdn.cliqz.com/adblocker/engines/${adblockerVersion}`));
  const adConsmeticRules = await (await fetch(adConsmeticEngine.url)).arrayBuffer();
  fs.writeFileSync('src/adblocker_engines/dnr-ads-cosmetics.engine.bytes', new Uint8Array(adConsmeticRules));

  // Tracking rules
  const trackingList = await (
    await fetch(
      'https://cdn.cliqz.com/adblocker/configs/dnr-cosmetics-tracking/allowed-lists.json',
    )
  ).json();

  // Tracking Consmetic rules
  const trackingConsmeticEngine = Object.values(trackingList.engines).find(e => e.url.startsWith(`https://cdn.cliqz.com/adblocker/engines/${adblockerVersion}`));
  const trackingConsmeticRules = await (
    await fetch(trackingConsmeticEngine.url)
  ).arrayBuffer();
  fs.writeFileSync('src/adblocker_engines/dnr-tracking-cosmetics.engine.bytes', new Uint8Array(trackingConsmeticRules));

  // Annoyances rules
  const annoyancesList = await (
    await fetch(
      'https://cdn.cliqz.com/adblocker/configs/dnr-cosmetics-annoyances/allowed-lists.json',
    )
  ).json();

  // Tracking Consmetic rules
  const annoyancesConsmeticEngine = Object.values(annoyancesList.engines).find(e => e.url.startsWith(`https://cdn.cliqz.com/adblocker/engines/${adblockerVersion}`));
  const annoyancesConsmeticRules = await (
    await fetch(annoyancesConsmeticEngine.url)
  ).arrayBuffer();
  fs.writeFileSync('src/adblocker_engines/dnr-annoyances-cosmetics.engine.bytes', new Uint8Array(annoyancesConsmeticRules));
})();
