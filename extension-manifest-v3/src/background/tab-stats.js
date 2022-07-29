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

import Options from '/store/options.js';
import { getTrackerFromUrl } from './utils/bugs.js';
import tabStats from './utils/tab-stats.js';

const setIcon = throttle((tabId, stats) => {
  const categories = stats.trackers.map((t) => t.category);
  const imageData = getOffscreenImageData(128, categories);

  (chrome.browserAction || chrome.action).setIcon({
    tabId,
    imageData,
  });
}, 250);

async function updateTabStats(msg, sender) {
  const tabId = sender.tab.id;
  const stats = tabStats.get(tabId);
  const urls = msg.args[0].urls;
  const loadTime = msg.args[0].loadTime;

  if (loadTime && sender.frameId === 0) {
    stats.loadTime = loadTime;
  }

  if (urls) {
    urls.forEach((url) => {
      const tracker = getTrackerFromUrl(url, stats.domain);
      if (tracker) {
        stats.trackers.push(tracker);
      }
    });
  }

  tabStats.set(tabId, stats);

  const { trackerWheelDisabled } = await store.resolve(store.get(Options));

  if (!trackerWheelDisabled && stats.trackers.length > 0) {
    setIcon(tabId, stats);
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStats.delete(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.tab?.id && sender.frameId !== undefined) {
    // We cannot trust that Safari fires "chrome.webNavigation.onCommitted"
    // with the correct tabId (sometimes it is correct, sometimes it is 0).
    // Thus, let the content_script fire it.
    if (sender.url && msg.action === 'onCommitted') {
      const { domain } = parse(sender.url);

      if (domain) {
        tabStats.set(sender.tab.id, { domain, trackers: [], loadTime: 0 });

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
