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

export async function openTabWithUrl(host, event) {
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

  try {
    const tabs = await chrome.tabs.query({
      url: href.split('#')[0],
      currentWindow: true,
    });

    if (tabs.length) {
      await chrome.tabs.update(tabs[0].id, {
        active: true,
        url: href !== tabs[0].url ? href : undefined,
      });

      window.close();
      return;
    }
  } catch (e) {
    console.error('[utils|tabs] Error while try to find existing tab:', e);
  }

  chrome.tabs.create({ url: href });
  window.close();
}

export async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}
