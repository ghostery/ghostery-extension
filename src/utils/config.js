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
import { getBrowser, isWebkit } from './browser-info.js';

const SUPPORTED_FILTERS = ['platform', 'browser', 'version'];

export function filter(item) {
  if (item.filter) {
    // Ensure that the current environment supports all specified filters
    // Otherwise, we return false and the item is filtered out.
    let check = Object.keys(item.filter).every((key) => {
      if (!SUPPORTED_FILTERS.includes(key)) {
        console.warn(`[config] Unsupported filter key: ${key}`);
        return false;
      }

      return true;
    });

    // Platform check
    // Possible values: 'chromium', 'firefox', 'webkit'
    if (check && Array.isArray(item.filter.platform)) {
      let platform;
      if (__CHROMIUM__) {
        platform = isWebkit() ? 'webkit' : 'chromium';
      } else if (__FIREFOX__) {
        platform = 'firefox';
      }

      check = item.filter.platform.includes(platform);
    }

    // Browser check
    // Values from getBrowser() method
    if (check && typeof item.filter.browser === 'string') {
      check = getBrowser().name === item.filter.browser;
    }

    // Version check
    // Checks that the extension version is equal or higher
    if (check && typeof item.filter.version === 'string') {
      const version = chrome.runtime
        .getManifest()
        .version.split('.')
        .map((n) => parseInt(n, 10));

      const filterVersion = item.filter.version.split('.').map((n) => parseInt(n, 10));

      for (let i = 0; i < filterVersion.length; i += 1) {
        const v = version[i];
        const f = filterVersion[i];

        if (v > f) {
          // check === true
          break;
        }

        if (v < f) {
          check = false;
          break;
        }
      }
    }

    return check;
  }

  return true;
}
