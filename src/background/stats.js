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
import Options from '/store/options.js';
import TabStats from '/store/tab-stats.js';

import { getMetadata, getUnidentifiedTracker } from '/utils/trackerdb.js';
import Request from '/utils/request.js';
import { isWebkit } from '/utils/browser-info.js';
import { getMatchedRequestUrls } from '/utils/dnr.js';
import debounce from '/utils/debounce.js';

import { recordSerpVisit } from './telemetry/index.js';

import * as logger from './logger.js';
import { SERP_URL_REGEXP } from './serp.js';

const REQUESTS_LIMIT = 100;
const OBSERVED_REQUESTS_LIMIT = 25;

async function updateRequests(tabId, requests) {
  const stats = await store.resolve(TabStats, tabId);

  // Stats are empty for the tabs without http pages (or closed), and on Firefox using
  // webRequest.onBeforeRequest some of the requests are fired before the tab is created, tabId -1
  if (!stats.hostname) return;

  // Saved with the stats, so the next update only looks for the rules matched since then
  const updatedAt = Date.now();

  requests = requests.filter(
    (request) =>
      // Requests made before the navigation belong to the previous page
      request.timestamp >= stats.createdAt &&
      // Filter out requests that are not related to the current page,
      // as a fallback, we assume that the request is from the origin URL
      (!request.sourceHostname || request.sourceHostname.endsWith(stats.hostname)),
  );

  // Requests blocked by the DNR rules since the last update (only Safari returns their details).
  // The stats keep updatedAt of the previous page after a navigation, so the newer time is used
  const matchedUrls =
    __CHROMIUM__ && isWebkit()
      ? await getMatchedRequestUrls(tabId, Math.max(stats.createdAt, stats.updatedAt))
      : [];

  for (const url of matchedUrls) {
    const request = Request.fromRequestDetails({ url, originUrl: stats.url });
    request.blocked = true;
    requests.push(request);
  }

  logger.logRequests(requests);

  const options = await store.resolve(Options);

  // Model instances are immutable, so the requests are applied to copies of the trackers
  const trackers = Object.fromEntries(
    Object.entries(stats.trackers).map(([key, t]) => [
      key,
      { ...t, requests: t.requests.map((r) => ({ ...r })) },
    ]),
  );

  // Saved requests by their URL, with the trackers they are listed in
  const savedRequests = new Map(
    Object.values(trackers).flatMap((tracker) =>
      tracker.requests.map((r) => [r.url, [r, tracker]]),
    ),
  );

  // The update time is saved when rules were matched, even if nothing changed,
  // so the next update doesn't fetch them again (and count the trimmed ones twice)
  let changed = matchedUrls.length > 0;

  for (const request of requests) {
    // Blocking applies to the whole redirect chain recorded under the request id
    if (request.blocked && request.requestId) {
      for (const [chainRequest, chainTracker] of savedRequests.values()) {
        if (chainRequest.requestId === request.requestId && !chainRequest.blocked) {
          chainRequest.blocked = true;
          chainTracker.blocked = true;
          changed = true;
        }
      }
    }

    // A recorded request only updates its state
    const [savedRequest, savedTracker] = savedRequests.get(request.url) || [];
    if (savedRequest) {
      if (
        (request.blocked && !savedRequest.blocked) ||
        (request.modified && !savedRequest.modified)
      ) {
        savedRequest.blocked ||= request.blocked;
        savedRequest.modified ||= request.modified;
        savedTracker.blocked ||= request.blocked;
        savedTracker.modified ||= request.modified;
        changed = true;
      }

      continue;
    }

    const metadata =
      getMetadata(request) ||
      ((request.blocked || request.modified || options.exceptions[request.hostname]) &&
        getUnidentifiedTracker(request.hostname));

    if (!metadata) continue;

    const tracker = (trackers[metadata.id] ??= {
      ...metadata,
      key: metadata.id,
      requests: [],
      requestsCount: 0,
    });

    tracker.requestsCount += 1;
    tracker.blocked ||= request.blocked;
    tracker.modified ||= request.modified;
    changed = true;

    // Observed requests are listed up to the limit, but all of them are counted
    if (
      request.blocked ||
      request.modified ||
      tracker.requests.filter((r) => !r.blocked && !r.modified).length < OBSERVED_REQUESTS_LIMIT
    ) {
      const { requestId, url, blocked, modified } = request;

      tracker.requests.unshift({ requestId, url, blocked, modified });
      savedRequests.set(url, [tracker.requests[0], tracker]);

      // Requests over the limit are no longer listed, so they are removed from the index too
      for (const r of tracker.requests.splice(REQUESTS_LIMIT)) savedRequests.delete(r.url);
    }
  }

  if (!changed) return;

  // Stats replaced in the meantime (e.g. by a navigation) have a different createdAt,
  // and then the requests belong to the previous page
  const currentStats = await store.resolve(TabStats, tabId);
  if (currentStats.createdAt === stats.createdAt) {
    await store.set(currentStats, { trackers, updatedAt });
  }
}

// Requests are kept in memory, and applied to the stats of their tabs in batches
const pendingRequests = new Map();

function flushRequests() {
  const batch = [...pendingRequests];
  pendingRequests.clear();

  for (const [tabId, requests] of batch) {
    // Each tab is updated separately, so a failed update doesn't skip the others
    updateRequests(tabId, requests).catch((e) =>
      console.error('[stats] Failed to update tab stats', e),
    );
  }
}

const scheduleFlush = debounce(flushRequests, { waitFor: 200, maxWait: 1000 });

export function updateTabStats(tabId, request) {
  // Requests created without the details from the browser are timed on arrival
  request.timestamp ??= Date.now();

  const pending = pendingRequests.get(tabId);
  if (pending) pending.push(request);
  else pendingRequests.set(tabId, [request]);

  scheduleFlush();
}

async function flushTabStatsToDailyStats(stats) {
  if (!stats.hostname || stats.incognito) return;

  // Count SERP visits with the page view so both share timing and incognito exclusion.
  if (SERP_URL_REGEXP.test(stats.url)) recordSerpVisit();

  let dailyStats = await store.resolve(DailyStats, new Date().toISOString().split('T')[0]);

  // Daily stats updated in the meantime by another page (e.g. tabs closed at once)
  // are resolved again, so the counts are added to their latest values
  while (store.pending(dailyStats)) {
    dailyStats = await store.resolve(dailyStats);
  }

  await store.set(dailyStats, {
    trackersBlocked: dailyStats.trackersBlocked + stats.trackersBlocked,
    trackersModified: dailyStats.trackersModified + stats.trackersModified,
    pages: dailyStats.pages + 1,
    patterns: [...new Set([...dailyStats.patterns, ...Object.keys(stats.trackers)])],
  });
}

const PANEL_URL = chrome.runtime.getURL('pages/panel/index.html');

// Setup stats for the tab when a user navigates to a new page
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // The panel can be opened in the same tab only by e2e tests
  // and then we have to keep the stats
  if (details.url === PANEL_URL) return;

  if (details.tabId > -1 && details.parentFrameId === -1) {
    const { tabId } = details;
    const request = Request.fromRequestDetails(details);

    const stats = store.get(TabStats, tabId);

    // store.get() is synchronous, so for updating previous
    // page stats we need to resolve it first
    store.resolve(stats).then(flushTabStatsToDailyStats);

    if (request.isHttp || request.isHttps) {
      const currentStats = await store.set(stats, {
        hostname: request.hostname,
        domain: request.domain,
        url: request.url,
        // Records are merged on set, so an empty object would keep the previous trackers
        trackers: null,
        createdAt: details.timeStamp,
      });
      const tab = await chrome.tabs.get(details.tabId).catch(() => null);
      if (tab?.incognito) await store.set(currentStats, { incognito: true });
    } else {
      await store.set(stats, null);
    }
  }
});

if (__CHROMIUM__ && chrome.webRequest) {
  // Gather stats for requests that are not main_frame
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.tabId < 0 || details.type === 'main_frame') return;

      const request = Request.fromRequestDetails(details);
      updateTabStats(details.tabId, request);
    },
    {
      urls: ['<all_urls>'],
    },
  );

  // Get feedback for requests, which were redirected
  chrome.webRequest.onBeforeRedirect.addListener(
    (details) => {
      if (details.redirectUrl.startsWith('chrome-extension://')) {
        const request = Request.fromRequestDetails(details);
        request.blocked = true;
        updateTabStats(details.tabId, request);
      }
    },
    { urls: ['<all_urls>'] },
  );

  // Get feedback for requests, which were blocked
  chrome.webRequest.onErrorOccurred.addListener(
    (details) => {
      if (details.error === 'net::ERR_BLOCKED_BY_CLIENT') {
        const request = Request.fromRequestDetails(details);
        request.blocked = true;

        updateTabStats(details.tabId, request);
      }
    },
    {
      urls: ['<all_urls>'],
    },
  );
}

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const stats = await store.resolve(TabStats, tabId);

  // Removed first, so the stats don't stay in the storage if the daily stats fail
  await store.set(stats, null);
  await flushTabStatsToDailyStats(stats);
});
