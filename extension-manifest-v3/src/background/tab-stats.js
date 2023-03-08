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
import { parse } from 'tldts-experimental';
import { store } from 'hybrids';
import { throttle } from 'lodash-es';
import { getOffscreenImageData } from '@ghostery/ui/wheel';
import { order } from '@ghostery/ui/categories';

import { getMetadata } from './utils/trackerdb.js';
import Options from '/store/options.js';
import tabStats from './utils/map.js';

const action = chrome.browserAction || chrome.action;
action.setBadgeBackgroundColor({ color: '#3f4146' /* gray-600 */ });

const setIcon = throttle(async (tabId, stats) => {
  const options = await store.resolve(Options);

  if (options.trackerWheel && stats.trackers.length > 0) {
    const paused = options.paused?.some(({ id }) => id === stats.domain);
    const data = {};

    if (paused) {
      data.path = {
        16: '/assets/images/icon19_off.png',
        32: '/assets/images/icon38_off.png',
      };
    } else {
      data.imageData = getOffscreenImageData(
        128,
        stats.trackers.map((t) => t.category),
      );
    }

    action.setIcon({ tabId, ...data });
  }

  if (Options.trackerCount) {
    action.setBadgeText({
      tabId,
      text: options.trackerCount ? String(stats.trackers.length) : '',
    });
  }
}, 250);

export async function updateTabStats(tabId, urls) {
  const stats = tabStats.get(tabId);

  // Stats might not be available on Firefox using webRequest.onBeforeRequest
  // as some of the requests are fired before the tab is created, tabId -1
  if (!stats) return;

  const newUrls = urls.filter(
    (url) => !stats.trackers.some((t) => t.url === url),
  );

  for (const url of newUrls) {
    const pattern = await getMetadata(url, stats.sourceUrl);
    if (pattern) {
      stats.trackers.push(pattern);
    }
  }

  stats.trackers.sort(
    (a, b) => order.indexOf(a.category) - order.indexOf(b.category),
  );

  tabStats.set(tabId, stats);
  setIcon(tabId, stats);
}

export function setupTabStats(tabId, url, domain) {
  if (domain) {
    tabStats.set(tabId, {
      domain,
      trackers: [],
      sourceUrl: url,
    });

    // Clean up throttled icon update
    setIcon.cancel();
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStats.delete(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getCurrentTabId') {
    sendResponse(sender.tab?.id);
    return false;
  }

  if (
    __PLATFORM__ !== 'firefox' &&
    sender.tab?.id &&
    sender.frameId !== undefined
  ) {
    // We cannot trust that Safari fires "chrome.webNavigation.onCommitted"
    // with the correct tabId (sometimes it is correct, sometimes it is 0).
    // Thus, let the content_script fire it.
    if (sender.url && msg.action === 'onCommitted') {
      setupTabStats(sender.tab.id, sender.url, parse(sender.url).domain);
      return false;
    }

    if (msg.action === 'updateTabStats') {
      return updateTabStats(sender.tab.id, msg.urls);
    }
  }

  return false;
});
