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

const { icons } = chrome.runtime.getManifest();
const inactiveIcons = Object.keys(icons).reduce((acc, key) => {
  acc[key] = icons[key].replace('.', '-inactive.');
  return acc;
}, {});

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
  const options = await store.resolve(Options);

  const stats = tabStats.get(tabId);
  if (!stats) return;

  const inactive =
    !options.terms || options.paused?.some(({ id }) => id === stats.domain);

  const data = {};
  if (options.trackerWheel && stats.trackers.length > 0) {
    data.imageData = getOffscreenImageData(
      128,
      stats.trackers.map((t) => t.category),
      { grayscale: inactive },
    );
  } else {
    data.path = inactive ? inactiveIcons : icons;
  }

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
function updateIcon(tabId, force) {
  if (delayMap.has(tabId)) {
    if (!force) return;
    clearTimeout(delayMap.get(tabId));
  }

  delayMap.set(
    tabId,
    setTimeout(
      () => {
        delayMap.delete(tabId);
        refreshIcon(tabId);
      },
      // Firefox flickers when updating the icon, so we should expand the debounce delay
      __PLATFORM__ === 'firefox' ? 1000 : 250,
    ),
  );

  refreshIcon(tabId);
}

export function updateTabStats(tabId, requests) {
  Promise.resolve().then(async () => {
    const stats = tabStats.get(tabId);

    // Stats might not be available on Firefox using webRequest.onBeforeRequest
    // as some of the requests are fired before the tab is created, tabId -1
    if (!stats) return;

    let trackersUpdated = false;
    let requestsUpdated = false;

    // Filter out requests that are not related to the current page
    // (e.g. requests on trailing edge when navigation to a new page is in progress)
    requests = requests.filter((request) => request.isFromOriginUrl(stats.url));

    for (const request of requests) {
      const pattern = await trackerDb.getMetadata(request, {
        getDomainMetadata: true,
      });

      if (pattern || request.blocked || request.modified) {
        let tracker =
          (pattern && stats.trackers.find((t) => t.id === pattern.id)) ||
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
          trackersUpdated = true;
        }

        if (!tracker.requests.some((r) => r.url === request.url)) {
          tracker.requestsCount = (tracker.requestsCount || 0) + 1;
          tracker.blocked = tracker.blocked || request.blocked;
          tracker.modified = tracker.modified || request.modified;

          let blocked = Number(request.blocked);
          let modified = Number(request.modified);
          let observed = !blocked && !modified ? 1 : 0;

          tracker.requests = tracker.requests.filter((r) => {
            if (r.blocked) {
              return ++blocked <= 10 ? true : false;
            }

            if (r.modified) {
              return ++modified <= 10 ? true : false;
            }

            return ++observed <= 10 ? true : false;
          });

          tracker.requests.unshift({
            id: request.requestId,
            url: request.url,
            blocked: request.blocked,
            modified: request.modified,
          });

          requestsUpdated = true;
        }
      }
    }

    if (trackersUpdated) {
      stats.trackers.sort(
        (a, b) => order.indexOf(a.category) - order.indexOf(b.category),
      );
    }

    // After navigation stats are cleared, so the current `stats` variable might be outdated
    if (requestsUpdated && stats === tabStats.get(tabId)) {
      tabStats.set(tabId, stats);

      // We need to update the icon only if new categories were added
      if (trackersUpdated) updateIcon(tabId);
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
        adsDetected.get(tracker.name) || tracker.blocked,
      );
    } else {
      trackersDetected.set(
        tracker.name,
        trackersDetected.get(tracker.name) || tracker.blocked,
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

function setupTabStats(tabId, request) {
  flushTabStatsToDailyStats(tabId);

  if (request.isHttp || request.isHttps) {
    tabStats.set(tabId, {
      url: request.url,
      domain: request.domain || request.hostname,
      trackers: [],
    });
  } else {
    tabStats.delete(tabId);
  }

  updateIcon(tabId, true);
}

// Setup stats for the tab when a user navigates to a new page
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.tabId < 0) return;

  if (details.parentFrameId === -1) {
    setupTabStats(details.tabId, Request.fromRequestDetails(details));
  }
});

if (__PLATFORM__ === 'safari') {
  // On Safari we have content script to sends back the list of urls
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (sender.url && sender.frameId !== undefined && sender.tab?.id > -1) {
      switch (msg.action) {
        case 'updateTabStats':
          // On Safari `onBeforeNavigate` event is not trigger correctly
          // if a user navigates to the page by setting URL in the address bar.
          // This condition ensures that we setup tabStats for the tab
          // when `updateTabStats` message is received.
          if (tabStats.get(sender.tab.id)?.url !== sender.url) {
            setupTabStats(
              sender.tab.id,
              Request.fromRequestDetails({ url: sender.url }),
            );
          }

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

if (__PLATFORM__ !== 'safari' && __PLATFORM__ !== 'firefox') {
  // Chromium based browser can use readonly webRequest API
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

  // Callback for listing if requests were blocked by the DNR
  chrome.webRequest.onErrorOccurred.addListener(
    (details) => {
      if (details.error === 'net::ERR_BLOCKED_BY_CLIENT') {
        const stats = tabStats.get(details.tabId);
        if (!stats) return;

        for (const tracker of stats.trackers) {
          for (const request of tracker.requests) {
            if (request.id === details.requestId) {
              request.blocked = true;
              tracker.blocked = true;

              return;
            }
          }
        }
      }
    },
    {
      urls: ['<all_urls>'],
    },
  );
}
