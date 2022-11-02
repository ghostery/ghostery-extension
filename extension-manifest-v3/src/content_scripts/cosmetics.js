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
import { injectCosmetics } from '@cliqz/adblocker-webextension-cosmetics';

async function getCosmeticsFilters(args) {
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'getCosmeticsFilters',
      ...args,
    });

    return result || {};
  } catch (e) {
    console.error('Error while getting cosmetic filters:', e);
    return {};
  }
}

injectCosmetics(window, true, getCosmeticsFilters);
