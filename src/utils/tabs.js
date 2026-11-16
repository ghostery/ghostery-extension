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

import { getOS } from './browser-info.js';

export async function openHref(host, event) {
  // Firefox does not support Tabs API in iframes (Trackers Preview)
  // Firefox Android does not allow using `window.close()` in async event listeners
  if (__FIREFOX__ && (!chrome.tabs || getOS() === 'android')) {
    event.currentTarget.target = '_blank';
    // Timeout is required to prevent from closing the window before the anchor is opened
    setTimeout(() => window.close(), 50);

    return;
  }

  const { href } = event.currentTarget;
  event.preventDefault();

  await openTabWithUrl(href);

  window.close();
}

export async function openTabWithUrl(url) {
  try {
    const tabs = await chrome.tabs.query({
      url: url.split('#')[0],
      currentWindow: true,
    });

    // On Firefox Android, tabs.query may resolve with undefined here —
    // see queryFirstTab() below for details
    if (Array.isArray(tabs) && tabs.length) {
      await chrome.tabs.update(tabs[0].id, {
        active: true,
        url: url !== tabs[0].url ? url : undefined,
      });
      return;
    }
  } catch (e) {
    console.error('[utils|tabs] Error while try to find existing tab:', e);
  }

  await chrome.tabs.create({ url });
}

// NOTE: tabs.query still resolves with undefined instead of an array on Firefox
// Android (Fenix) in extension pages not associated with a tab (e.g. the panel
// popup) — observed on Firefox 160, even though the original bug was closed as
// fixed in GeckoView in 2020: https://bugzilla.mozilla.org/show_bug.cgi?id=1650897
// Normalize to null instead of throwing.
async function queryFirstTab(queryInfo) {
  try {
    const tabs = await chrome.tabs.query(queryInfo);
    return (Array.isArray(tabs) && tabs[0]) || null;
  } catch (e) {
    console.error('[utils|tabs] Error while querying tabs:', e, queryInfo);
    return null;
  }
}

export async function getCurrentTab() {
  // Try the narrow query first, then a wider one, and finally give up with null
  return (
    (await queryFirstTab({ active: true, currentWindow: true })) ||
    (await queryFirstTab({ active: true })) ||
    null
  );
}
