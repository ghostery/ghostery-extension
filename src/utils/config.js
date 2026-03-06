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

const SUPPORTED_FILTERS = ['platform', 'browser', 'version', 'minVersion', 'maxVersion'];

/**
 * Compare two version strings.
 * Returns -1 if a < b, 0 if a === b, 1 if a > b.
 */
export function compareVersions(a, b) {
  const partsA = a.split('.').map((n) => parseInt(n, 10));
  const partsB = b.split('.').map((n) => parseInt(n, 10));

  const length = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < length; i += 1) {
    const va = partsA[i] || 0;
    const vb = partsB[i] || 0;

    if (va > vb) return 1;
    if (va < vb) return -1;
  }

  return 0;
}

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

    const extensionVersion = chrome.runtime.getManifest().version;

    // Version check (legacy, same as minVersion)
    // Checks that the extension version is equal or higher
    // TODO: Remove when no active usage of version check is left
    if (check && typeof item.filter.version === 'string') {
      item.filter.minVersion = item.filter.version;
    }

    // minVersion check
    // Checks that the extension version is equal or higher than minVersion
    if (check && typeof item.filter.minVersion === 'string') {
      check = compareVersions(extensionVersion, item.filter.minVersion) >= 0;
    }

    // maxVersion check
    // Checks that the extension version is equal or lower than maxVersion
    if (check && typeof item.filter.maxVersion === 'string') {
      check = compareVersions(extensionVersion, item.filter.maxVersion) <= 0;
    }

    return check;
  }

  return true;
}
