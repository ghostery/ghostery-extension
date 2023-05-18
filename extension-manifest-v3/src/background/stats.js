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

import { getOffscreenImageData } from '@ghostery/ui/wheel';
import { order } from '@ghostery/ui/categories';

import DailyStats, { getMergedStats } from '/store/daily-stats.js';
import Options, { observe } from '/store/options.js';

import Request from './utils/request.js';
import * as trackerDb from './utils/trackerdb.js';
import AutoSyncingMap from './utils/map.js';

export const tabStats = new AutoSyncingMap({ storageKey: 'tabStats:v1' });

function setBadgeColor(color = '#3f4146' /* gray-600 */) {
  chrome.action.setBadgeBackgroundColor({ color });
}

observe('terms', async (terms) => {
  if (!terms) {
    await chrome.action.setBadgeText({ text: '!' });
    setBadgeColor('#f13436' /* danger-500 */);
  } else {
    await chrome.action.setBadgeText({ text: '' });
    setBadgeColor();
  }
});

async function refreshIcon(tabId) {
  const stats = tabStats.get(tabId);
  const options = await store.resolve(Options);

  if (options.trackerWheel && stats.trackers.length > 0) {
    const paused = options.paused?.some(({ id }) => id === stats.domain);
    const data = {};

    if (paused || !options.terms) {
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
    try {
      await chrome.action.setIcon({ tabId, ...data });
    } catch (e) {
      console.error('Error while trying update the icon:', e);
    }
  }

  if (Options.trackerCount) {
    try {
      await chrome.action.setBadgeText({
        tabId,
        text: options.trackerCount ? String(stats.trackers.length) : '',
      });
    } catch (e) {
      console.error('Error while trying update the badge', e);
    }
  }
}

const delayMap = new Map();
function updateIcon(tabId) {
  if (delayMap.has(tabId)) return;

  const timeoutId = setTimeout(
    () => {
      delayMap.delete(tabId);
      refreshIcon(tabId);
    },
    // Firefox flickers when updating the icon, so we should expand the throttle
    __PLATFORM__ === 'firefox' ? 1000 : 250,
  );

  delayMap.set(tabId, timeoutId);
  refreshIcon(tabId);
}

updateIcon.cancel = (tabId) => {
  const timeoutId = delayMap.get(tabId);
  if (timeoutId) {
    clearTimeout(timeoutId);
    delayMap.delete(tabId);
  }
};

export async function getStatsWithMetadata(since) {
  const result = await getMergedStats(since);

  const patternsDetailed = [];
  for (const key of result.patterns) {
    const pattern = await trackerDb.getPattern(key);
    if (pattern) patternsDetailed.push(pattern);
  }

  return Object.assign(result, { patternsDetailed });
}

export async function updateTabStats(tabId, requests) {
  const stats = tabStats.get(tabId);

  // Stats might not be available on Firefox using webRequest.onBeforeRequest
  // as some of the requests are fired before the tab is created, tabId -1
  if (!stats) return;

  for (const request of requests) {
    const pattern = await trackerDb.getMetadata(request, {
      getDomainMetadata: true,
    });

    if (pattern) {
      let tracker = stats.trackers.find((t) => t.id === pattern.id);

      if (!tracker) {
        tracker = { ...pattern, requests: [] };
        stats.trackers.push(tracker);
      }

      tracker.requests.push({ url: request.url, blocked: request.blocked });
    }
  }

  stats.trackers.sort(
    (a, b) => order.indexOf(a.category) - order.indexOf(b.category),
  );

  tabStats.set(tabId, stats);
  updateIcon(tabId);
}

const DAILY_STATS_ADS_CATEGORY = 'advertising';
async function flushTabStatsToDailyStats(tabId) {
  const stats = tabStats.get(tabId);
  if (!stats || !stats.trackers.length) return;

  const adsDetected = new Map();
  const trackersDetected = new Map();

  for (const tracker of stats.trackers) {
    if (tracker.category === DAILY_STATS_ADS_CATEGORY) {
      adsDetected.set(
        tracker.name,
        adsDetected.get(tracker.name)?.blocked ??
          tracker.requests.some(({ blocked }) => blocked),
      );
    } else {
      trackersDetected.set(
        tracker.name,
        trackersDetected.get(tracker.name)?.blocked ??
          tracker.requests.some(({ blocked }) => blocked),
      );
    }
  }

  const adsBlocked = [...adsDetected.values()].filter(Boolean).length;
  const trackersBlocked = [...trackersDetected.values()].filter(Boolean).length;

  const dailyStats = await store.resolve(
    DailyStats,
    new Date().toISOString().split('T')[0],
  );

  const patterns = [
    ...new Set([...dailyStats.patterns, ...stats.trackers.map((t) => t.id)]),
  ];

  await store.set(dailyStats, {
    adsDetected: dailyStats.adsDetected + adsDetected.size,
    adsBlocked: dailyStats.adsBlocked + adsBlocked,
    trackersDetected: dailyStats.trackersDetected + trackersDetected.size,
    trackersBlocked: dailyStats.trackersBlocked + trackersBlocked,
    requestsDetected:
      dailyStats.requestsDetected +
      stats.trackers.reduce((acc, tracker) => {
        acc += tracker.requests.length;
        return acc;
      }, 0),
    requestsBlocked: dailyStats.requestsBlocked + adsBlocked + trackersBlocked,
    pages: dailyStats.pages + 1,
    patterns,
  });
}

export function setupTabStats(tabId, domain) {
  flushTabStatsToDailyStats(tabId);

  if (domain) {
    tabStats.set(tabId, {
      domain,
      requestsBlocked: [],
      trackers: [],
    });

    // Clean up icon update
    updateIcon.cancel(tabId);
  } else {
    tabStats.delete(tabId);
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  flushTabStatsToDailyStats(tabId);
  tabStats.delete(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getCurrentTab') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      sendResponse(tab);
    });
    return true;
  }

  if (
    __PLATFORM__ === 'safari' &&
    sender.tab?.id &&
    sender.frameId !== undefined
  ) {
    // We cannot trust that Safari fires "chrome.webNavigation.onCommitted"
    // with the correct tabId (sometimes it is correct, sometimes it is 0).
    // Thus, let the content_script fire it.
    if (sender.url && msg.action === 'onCommitted') {
      setupTabStats(sender.tab.id, parse(sender.url).domain);
      return false;
    }

    if (msg.action === 'updateTabStats') {
      return updateTabStats(
        sender.tab.id,
        msg.urls.map((url) =>
          Request.fromRawDetails({ url, sourceUrl: sender.url }),
        ),
      );
    }
  }

  return false;
});

// Following code only applies to chromium-based browsers excluding:
// * Safari - it does not support chrome.webRequest.onBeforeRequest
// * Firefox - it has own implementation in `./adblocker.js` with blocking requests
if (__PLATFORM__ !== 'safari' && __PLATFORM__ !== 'firefox') {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.tabId < 0) return;

      const request = Request.fromRequestDetails(details);

      Promise.resolve().then(
        request.isMainFrame()
          ? () =>
              setupTabStats(
                details.tabId,
                request.sourceDomain || request.sourceHostname,
              )
          : () => updateTabStats(details.tabId, [request]),
      );
    },
    {
      urls: ['<all_urls>'],
    },
  );

  chrome.webRequest.onErrorOccurred.addListener(
    (details) => {
      if (details.error !== 'net::ERR_BLOCKED_BY_CLIENT') return;

      const stats = tabStats.get(details.tabId);
      stats?.requestsBlocked.push(details.requestId);
    },
    {
      urls: ['<all_urls>'],
    },
  );
}
