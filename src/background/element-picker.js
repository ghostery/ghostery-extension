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

import * as engines from '/utils/engines.js';
import ElementPickerSelectors from '/store/element-picker-selectors.js';

import { setup, reloadMainEngine } from './adblocker/engines.js';

export async function openElementPicker(tabId) {
  await chrome.scripting.executeScript({
    injectImmediately: true,
    world: chrome.scripting.ExecutionWorld?.ISOLATED ?? 'ISOLATED',
    target: { tabId },
    files: ['/content_scripts/element-picker.js'],
  });
}

// Makes one plain hiding filter for one hostname. Rejects any other
// filter syntax: scriptlets, styles, extended selectors, extra lines.
export function toCosmeticFilter(hostname, selector) {
  if (!/^[a-z0-9.-]+$/i.test(hostname)) return null;

  const { cosmeticFilters, networkFilters } = parseFilters(`${hostname}##${selector}`);
  const [filter] = cosmeticFilters;

  // Expect exactly one cosmetic filter
  if (!filter || cosmeticFilters.length > 1 || networkFilters.length > 0) return null;
  if (filter.isScriptInject() || filter.isExtended()) return null;
  if (filter.hasCustomStyle() || filter.isHtmlFiltering()) return null;

  return filter;
}

// Observe element picker selectors to update the adblocker engine
store.observe(ElementPickerSelectors, async (_, model, lastModel) => {
  let entries = Object.entries(model.hostnames);

  // Skip update if there is no change in the model
  if (!lastModel) {
    // and there is no entries, so engine is not needed
    if (!entries.length) return;
    // or engine already exists and it initializes correctly
    if (await engines.init(engines.ELEMENT_PICKER_ENGINE)) return;
  }

  if (entries.length) {
    const cosmeticFilters = [];

    for (const [hostname, selectors] of entries) {
      for (const selector of selectors) {
        const filter = toCosmeticFilter(hostname, selector);
        if (filter) {
          cosmeticFilters.push(filter);
        } else {
          console.warn(`[element-picker] Rejected selector for "${hostname}":`, selector);
        }
      }
    }

    await engines.create(engines.ELEMENT_PICKER_ENGINE, { cosmeticFilters });

    console.log(
      `[element-picker] Engine updated with ${cosmeticFilters.length} selectors for ${entries.length} hostnames`,
    );
  } else {
    engines.remove(engines.ELEMENT_PICKER_ENGINE);
    console.log('[element-picker] No selectors - engine removed');
  }

  setup.pending && (await setup.pending);
  await reloadMainEngine();
});

// Initialize element picker selectors
// to ensure that store.observe() is called
store.resolve(ElementPickerSelectors);
