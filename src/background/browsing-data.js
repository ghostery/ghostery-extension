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

import DailyStats from '/store/daily-stats.js';
import { SCOPE_ALL, SCOPE_WEBSITE, TIME_RANGES } from '/utils/browsing-data.js';

async function countCookies(hostname) {
  const stores = await chrome.cookies.getAllCookieStores();
  let count = 0;

  for (const { id } of stores) {
    const cookies = await chrome.cookies.getAll(
      hostname ? { domain: hostname, storeId: id } : { storeId: id },
    );
    count += cookies.length;
  }

  return count;
}

async function closeTabs(currentTabOnly) {
  const tabs = currentTabOnly
    ? await chrome.tabs.query({ active: true, currentWindow: true })
    : await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });

  if (!tabs.length) return;

  const remaining = new Map();
  for (const { windowId } of await chrome.tabs.query({})) {
    remaining.set(windowId, (remaining.get(windowId) || 0) + 1);
  }
  for (const { windowId } of tabs) {
    remaining.set(windowId, remaining.get(windowId) - 1);
  }

  // A window closes itself once its last tab is removed
  for (const [windowId, count] of remaining) {
    if (count === 0) {
      try {
        await chrome.tabs.create({ windowId });
      } catch (e) {
        console.error(`[browsing-data] Failed to keep the window ${windowId} open`, e);
      }
    }
  }

  try {
    await chrome.tabs.remove(tabs.map(({ id }) => id));
  } catch (e) {
    console.error('[browsing-data] Failed to close tabs', e);
  }
}

async function clearBrowsingData({
  scope,
  timeRange,
  tabs,
  cache,
  history,
  cookies,
  hostname,
  domain,
}) {
  if (scope !== SCOPE_WEBSITE && scope !== SCOPE_ALL) {
    throw new Error(`Unsupported scope: "${scope}"`);
  }

  if (!Object.hasOwn(TIME_RANGES, timeRange)) {
    throw new Error(`Unsupported time range: "${timeRange}"`);
  }

  const scoped = scope === SCOPE_WEBSITE;

  if (scoped && !hostname) {
    throw new Error(`Missing hostname for the "${SCOPE_WEBSITE}" scope`);
  }

  const since = TIME_RANGES[timeRange] ? Date.now() - TIME_RANGES[timeRange] : 0;

  const filter = scoped
    ? __FIREFOX__
      ? // Firefox matches hostnames literally, so the registrable domain must be listed as well
        { hostnames: [...new Set([hostname, domain].filter((h) => h))] }
      : { origins: [`http://${hostname}`, `https://${hostname}`] }
    : {};

  const errors = [];
  async function remove(dataTypes) {
    try {
      await chrome.browsingData.remove({ since, ...filter }, dataTypes);
    } catch (e) {
      errors.push(e);
      console.error(`[browsing-data] Failed to remove ${Object.keys(dataTypes).join(', ')}`, e);
    }
  }

  // Open pages write the data back while it is removed
  if (tabs) {
    await closeTabs(scoped);
  }

  let removedCookies = 0;

  if (cookies) {
    const siteData = {
      cookies: true,
      localStorage: true,
      indexedDB: true,
      serviceWorkers: true,
    };

    if (__CHROMIUM__) siteData.cacheStorage = true;

    // The browsingData API does not report how much data it removed
    const before = await countCookies(scoped ? hostname : '');
    await remove(siteData);
    const after = await countCookies(scoped ? hostname : '');

    removedCookies = Math.max(before - after, 0);
  }

  // Firefox does not support clearing the cache for a single hostname
  if (cache && !(__FIREFOX__ && scoped)) {
    await remove({ cache: true });
  }

  // The browsingData API cannot scope history to a hostname
  if (history && !scoped) {
    await remove({ history: true });
  }

  if (removedCookies) {
    const dailyStats = await store.resolve(DailyStats, new Date().toISOString().split('T')[0]);

    await store.set(dailyStats, {
      cookiesRemoved: dailyStats.cookiesRemoved + removedCookies,
    });
  }

  if (errors.length) {
    throw new AggregateError(errors, 'Failed to clear all of the selected browsing data');
  }

  console.log(`[browsing-data] Cleared browsing data for scope: ${scope}`);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'browsingData:clear') {
    // Only extension pages may trigger such a destructive action
    if (sender.id !== chrome.runtime.id || sender.tab) return;

    clearBrowsingData(msg.options)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('[browsing-data] Error clearing browsing data:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});
