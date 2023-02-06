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

import Options from '/store/options.js';
import { getTrackerFromUrl } from './utils/bugs.js';
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

async function updateTabStats(msg, sender) {
  const tabId = sender.tab.id;
  const stats = tabStats.get(tabId);

  msg.urls
    .filter((url) => !stats.trackers.some((t) => t.url === url))
    .forEach((url) => {
      const tracker = getTrackerFromUrl(url, stats.domain);
      if (tracker) {
        stats.trackers.push(tracker);
      }
    });

  stats.trackers.sort(
    (a, b) => order.indexOf(a.category) - order.indexOf(b.category),
  );

  tabStats.set(tabId, stats);
  setIcon(tabId, stats);
}

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStats.delete(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getCurrentTabId') {
    sendResponse(sender.tab?.id);
    return false;
  }

  if (sender.tab?.id && sender.frameId !== undefined) {
    // We cannot trust that Safari fires "chrome.webNavigation.onCommitted"
    // with the correct tabId (sometimes it is correct, sometimes it is 0).
    // Thus, let the content_script fire it.
    if (sender.url && msg.action === 'onCommitted') {
      const { domain } = parse(sender.url);

      if (domain) {
        tabStats.set(sender.tab.id, { domain, trackers: [] });

        // Clean up throttled icon update
        setIcon.cancel();
      }

      return false;
    }

    if (msg.action === 'updateTabStats') {
      return updateTabStats(msg, sender);
    }
  }

  return false;
});
