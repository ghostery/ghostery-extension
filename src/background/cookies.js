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

async function getAllCookies(domain) {
  const stores = await chrome.cookies.getAllCookieStores();
  const result = [];

  for (const store of stores) {
    const cookies = await chrome.cookies.getAll({ domain, storeId: store.id });
    result.push(...cookies);
  }

  return result;
}

async function clearCookiesForDomain(domain) {
  if (!domain) {
    console.warn('No domain provided for cookie cleaning');
    return 0;
  }

  try {
    // Get all cookies for the exact domain and its subdomains
    const cookies = await getAllCookies(domain);

    let removed = 0;

    // Filter and remove cookies related to the domain
    for (const cookie of cookies) {
      const url = `http${cookie.secure ? 's' : ''}://${cookie.domain.replace(/^\./, '')}${cookie.path}`;

      try {
        await chrome.cookies.remove({
          url: url,
          name: cookie.name,
          storeId: cookie.storeId,
        });
        removed++;

        console.debug(
          `[cookies] Removed cookie ${cookie.name} for domain ${domain}`,
        );
      } catch (error) {
        console.error(
          `[cookies] Failed to remove cookie ${cookie.name}:`,
          error,
        );
      }
    }

    // Update daily stats
    const dailyStats = await store.resolve(
      DailyStats,
      new Date().toISOString().split('T')[0],
    );

    store.set(dailyStats, {
      cookiesRemoved: dailyStats.cookiesRemoved + removed,
    });

    console.log(`[cookies] Removed ${removed} cookies for domain: ${domain}`);
    return removed;
  } catch (error) {
    console.error('[cookies] Error cleaning cookies:', error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'cookies:clean') {
    clearCookiesForDomain(msg.domain)
      .then((removed) => {
        sendResponse({ success: true, removed });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});
