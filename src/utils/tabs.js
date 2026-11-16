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
  // No Tabs API in Firefox iframes (Trackers Preview). On Firefox Android 139+, a popup
  // with history entries cannot close itself. Let the browser open the link.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1959610
  if (__FIREFOX__ && (!chrome.tabs || (getOS() === 'android' && history.length > 1))) {
    event.currentTarget.target = '_blank';
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

    if (tabs.length) {
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

export async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}
