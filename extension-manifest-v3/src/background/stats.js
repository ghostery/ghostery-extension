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

import { getOffscreenImageData } from '@ghostery/ui/wheel';
import { order } from '@ghostery/ui/categories';

import DailyStats, { getMergedStats } from '/store/daily-stats.js';
import Options, { observe } from '/store/options.js';

import { shouldShowOperaSerpAlert } from '/notifications/opera-serp.js';

import Request from './utils/request.js';
import * as trackerDb from './utils/trackerdb.js';
import AutoSyncingMap from './utils/map.js';

export const tabStats = new AutoSyncingMap({ storageKey: 'tabStats:v1' });

const chromeAction = chrome.action || chrome.browserAction;

function setBadgeColor(color = '#3f4146' /* gray-600 */) {
  chromeAction.setBadgeBackgroundColor({ color });
}

observe('terms', async (terms) => {
  if (
    !terms ||
    (__PLATFORM__ === 'opera' && (await shouldShowOperaSerpAlert()))
  ) {
    await chromeAction.setBadgeText({ text: '!' });
    setBadgeColor('#f13436' /* danger-500 */);
  } else {
    await chromeAction.setBadgeText({ text: '' });
    setBadgeColor();
  }
});

async function refreshIcon(tabId) {
  const stats = tabStats.get(tabId);
  if (!stats) return;

  const options = await store.resolve(Options);
  const paused = options.paused?.some(({ id }) => id === stats.domain);
  const data = {};

  if (paused || !options.terms) {
    data.path = {
      16: '/assets/images/icon19_off.png',
      32: '/assets/images/icon38_off.png',
    };
  } else if (options.trackerWheel && stats.trackers.length > 0) {
    data.imageData = getOffscreenImageData(
      128,
      stats.trackers.map((t) => t.category),
    );
  }

  if (data.path || data.imageData) {
    // Note: Even in MV3, this is not (yet) returning a promise.
    chromeAction.setIcon({ tabId, ...data }, () => {
      if (chrome.runtime.lastError) {
        console.debug(
          'setIcon failed for tabId',
          tabId,
          '(most likely the tab was closed)',
          chrome.runtime.lastError,
        );
      }
    });
  }

  if (Options.trackerCount) {
    try {
      await chromeAction.setBadgeText({
        tabId,
        text: options.trackerCount ? String(stats.trackers.length) : '',
      });
    } catch (e) {
      console.debug('Error while trying update the badge', e);
    }
  }
}

const delayMap = new Map();
function updateIcon(tabId) {
  if (delayMap.has(tabId)) return;

  delayMap.set(
    tabId,
    setTimeout(
      () => {
        delayMap.delete(tabId);
        refreshIcon(tabId);
      },
      // Firefox flickers when updating the icon, so we should expand the throttle
      __PLATFORM__ === 'firefox' ? 1000 : 250,
    ),
  );

  refreshIcon(tabId);
}

export function setupTabStats(tabId, domain) {
  flushTabStatsToDailyStats(tabId);

  if (domain) {
    tabStats.set(tabId, {
      domain,
      trackers: [],
    });
  } else {
    tabStats.delete(tabId);
  }

  updateIcon(tabId);
}

export function updateTabStats(tabId, requests) {
  Promise.resolve().then(async () => {
    const stats = tabStats.get(tabId);

    // Stats might not be available on Firefox using webRequest.onBeforeRequest
    // as some of the requests are fired before the tab is created, tabId -1
    if (!stats) return;

    let sortingRequired = false;

    // Filter out requests that are not related to the current domain
    // (e.g. requests on trailing edge when navigation to a new page is in progress)
    requests = requests.filter(
      (request) => request?.initiatorDomain === stats.domain ?? true,
    );

    for (const request of requests) {
      const pattern = await trackerDb.getMetadata(request, {
        getDomainMetadata: true,
      });

      if (pattern || request.blocked || request.modified) {
        let tracker =
          stats.trackers.find((t) => t.id === pattern.id) ||
          stats.trackers.find((t) => t.id === request.domain);

        if (!tracker) {
          tracker = pattern
            ? { ...pattern, requests: [] }
            : {
                id: request.domain,
                name: request.domain,
                category: 'unidentified',
                requests: [],
              };

          stats.trackers.push(tracker);
          sortingRequired = true;
        }

        tracker.requests.push({
          id: request.requestId,
          url: request.url,
          blocked: request.blocked,
          modified: request.modified,
        });
      }
    }

    if (sortingRequired) {
      stats.trackers.sort(
        (a, b) => order.indexOf(a.category) - order.indexOf(b.category),
      );
    }

    // After navigation stats are cleared, so the current `stats` variable might be outdated
    if (stats === tabStats.get(tabId)) {
      tabStats.set(tabId, stats);
      updateIcon(tabId);
    }
  });
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

export async function getStatsWithMetadata(since) {
  const result = await getMergedStats(since);

  const patternsDetailed = [];
  for (const key of result.patterns) {
    const pattern = await trackerDb.getPattern(key);
    if (pattern) patternsDetailed.push(pattern);
  }

  return Object.assign(result, { patternsDetailed });
}

chrome.tabs.onRemoved.addListener((tabId) => {
  flushTabStatsToDailyStats(tabId);
  tabStats.delete(tabId);
});

if (__PLATFORM__ === 'safari') {
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (sender.url && sender.frameId !== undefined && sender.tab?.id) {
      switch (msg.action) {
        // We cannot trust that Safari fires "chrome.webNavigation.onCommitted"
        // with the correct tabId (sometimes it is correct, sometimes it is 0).
        // Thus, let the content_script fire it.
        case 'onCommitted': {
          const request = Request.fromRequestDetails({ url: sender.url });
          setupTabStats(
            sender.tab.id,
            request.isHttp || request.isHttps
              ? request.domain || request.hostname
              : undefined,
          );
          break;
        }
        case 'updateTabStats':
          updateTabStats(
            sender.tab.id,
            msg.urls.map((url) =>
              Request.fromRequestDetails({ url, originUrl: sender.url }),
            ),
          );
          break;
      }
    }

    return false;
  });
}

if (__PLATFORM__ !== 'safari') {
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.tabId < 0) return;

    if (details.frameType === 'outermost_frame') {
      const request = Request.fromRequestDetails(details);

      setupTabStats(
        details.tabId,
        request.isHttp || request.isHttps
          ? request.domain || request.hostname
          : undefined,
      );
    }
  });
}

if (__PLATFORM__ !== 'safari' && __PLATFORM__ !== 'firefox') {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.tabId < 0) return;

      const request = Request.fromRequestDetails(details);
      if (details.type !== 'main_frame') {
        updateTabStats(details.tabId, [request]);
      }
    },
    {
      urls: ['<all_urls>'],
    },
  );

  chrome.webRequest.onErrorOccurred.addListener(
    (details) => {
      if (details.error !== 'net::ERR_BLOCKED_BY_CLIENT') return;

      const stats = tabStats.get(details.tabId);
      if (!stats) return;

      for (const tracker of stats.trackers) {
        for (const request of tracker.requests) {
          if (request.id === details.requestId) {
            request.blocked = true;
            return;
          }
        }
      }
    },
    {
      urls: ['<all_urls>'],
    },
  );
}
