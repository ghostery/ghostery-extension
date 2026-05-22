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

import { store } from 'hybrids';
import { parseFilters } from '@ghostery/adblocker';
import { xxh32 } from 'minixxh/xxh32';

import Options from '/store/options.js';

import { DISTRACTIONS_ID_RANGE, getDynamicRulesIds } from '/utils/dnr.js';
import convert from '/utils/dnr-converter.js';
import * as engines from '/utils/engines.js';
import * as OptionsObserver from '/utils/options-observer.js';

import { reloadMainEngine } from './adblocker/engines.js';

const FILTERS_URL = chrome.runtime.getURL('background/rule_resources/distractions.json');

async function fetchFilters() {
  const res = await fetch(FILTERS_URL);
  return res.json();
}

function getFiltersChecksum(filters) {
  const bytes = new TextEncoder().encode(
    Object.values(filters)
      .map((filters) => filters.join('\n'))
      .join('\n'),
  );
  return xxh32(bytes, 0, bytes.length).toString(16);
}

async function updateDistractions(distractions) {
  const filters = await fetchFilters();

  const enabledFilters = Object.entries(distractions)
    .filter(([, enabled]) => enabled)
    .flatMap(([id]) => filters[id] || []);

  if (enabledFilters.length === 0) {
    engines.remove(engines.DISTRACTIONS_ENGINE);
    console.info('[distractions] Engine removed...');

    if (__CHROMIUM__) {
      const removeRuleIds = await getDynamicRulesIds(DISTRACTIONS_ID_RANGE);
      if (removeRuleIds.length) {
        await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
        console.info('[distractions] DNR rules removed...');
      }
    }

    return;
  }

  const baseConfig = await engines.getConfig();
  const { networkFilters, cosmeticFilters, preprocessors } = parseFilters(
    enabledFilters.join('\n'),
    { ...baseConfig, debug: true },
  );

  if (__CHROMIUM__) {
    const removeRuleIds = await getDynamicRulesIds(DISTRACTIONS_ID_RANGE);
    if (removeRuleIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
    }

    if (networkFilters.length) {
      const { rules } = await convert(networkFilters.map((f) => f.rawLine));
      const dnrRules = rules.map((rule, index) => ({
        ...rule,
        id: DISTRACTIONS_ID_RANGE.start + index,
      }));
      await chrome.declarativeNetRequest.updateDynamicRules({ addRules: dnrRules });
      console.info(`[distractions] DNR updated with ${dnrRules.length} rule(s)`);
    }
  }

  await engines.create(engines.DISTRACTIONS_ENGINE, {
    networkFilters,
    cosmeticFilters,
    preprocessors,
    lists: { filters: getFiltersChecksum(filters) },
  });
  console.info(`[distractions] Engine updated with ${cosmeticFilters.length} filter(s)`);

  // Apply changes to the main engine
  await reloadMainEngine();
}

// On extension install/update, rebuild the engine if the stored filters are stale.
// This is more efficient than checking the checksum on every service worker startup.
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const engine = await engines.init(engines.DISTRACTIONS_ENGINE);
    if (!engine || engine.lists.get('filters') === getFiltersChecksum(await fetchFilters())) {
      return;
    }

    const { distractions } = await store.resolve(Options);
    await updateDistractions(distractions);
  } catch (e) {
    console.error('[distractions] Failed to update engine on install', e);
  }
});

OptionsObserver.addListener('distractions', async (value, lastValue) => {
  try {
    // On startup, skip if the engine is already initialized — onInstalled handles
    // stale engines after an extension update, so no checksum check is needed here.
    if (!lastValue) {
      if (!Object.values(value).some(Boolean)) return;
      if (await engines.init(engines.DISTRACTIONS_ENGINE)) return;
    }

    await updateDistractions(value);
  } catch (e) {
    console.error('[distractions] Failed to update engine', e);
  }
});
