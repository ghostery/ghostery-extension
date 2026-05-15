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

const DISTRACTION_FILTERS = {
  // Block the GSI client script on third-party pages (prevents both in-page One Tap
  // overlay and the native FedCM browser prompt from initializing)
  google:
    // Block the GSI client script on third-party pages (prevents One Tap and FedCM prompts)
    '||accounts.google.com/gsi/client$script,3p\n' +
    // Block the Sign-In button iframe
    '||accounts.google.com/gsi/button$subdocument,3p\n' +
    // Hide the in-page One Tap overlay container and iframe as a fallback
    '##[id="credential_picker_container"]\n' +
    '##[id="credential_picker_iframe"]',
  // Hide the "Open in app" / "Continue in app" interstitials and bottom bars on
  // mobile reddit.com so the web version stays usable.
  reddit:
    'reddit.com##xpromo-blocking-modal\n' +
    'reddit.com##xpromo-nsfw-blocking-modal\n' +
    'reddit.com##[bundlename="mweb_xpromo"]\n' +
    'reddit.com##div[class*="XPromoPopup"]\n' +
    'reddit.com##div[class*="XPromoBottomBar"]',
};

function getFiltersChecksum() {
  const bytes = new TextEncoder().encode(Object.values(DISTRACTION_FILTERS).join('\n'));
  return xxh32(bytes, 0, bytes.length).toString(16);
}

async function updateDistractions(distractions) {
  const enabledFilters = Object.entries(distractions)
    .filter(([, enabled]) => enabled)
    .map(([id]) => DISTRACTION_FILTERS[id])
    .filter(Boolean);

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
    lists: { filters: getFiltersChecksum() },
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
    if (!engine || engine.lists.get('filters') === getFiltersChecksum()) {
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
