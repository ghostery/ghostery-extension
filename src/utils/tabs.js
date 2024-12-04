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

export async function openTabWithUrl(host, event) {
  // Firefox does not support Tabs API in iframes (Trackers Preview)
  if (__PLATFORM__ === 'firefox' && !chrome.tabs) {
    event.currentTarget.target = '_blank';
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

      return;
    }
  } catch (e) {
    console.error('[utils|tabs] Error while try to find existing tab:', e);
  }

  chrome.tabs.create({ url: href });
}

export async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return null;

  if (tab.url !== window.location.href) {
    return tab;
  }

  const [otherTab] = await chrome.tabs.query({
    active: true,
    currentWindow: false,
  });

  return otherTab || null;
}
