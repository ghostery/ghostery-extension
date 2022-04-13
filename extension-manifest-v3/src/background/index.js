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
import { debounce } from 'lodash-es';
import { store } from 'hybrids';

import {
  tryWTMReportOnMessageHandler,
  isDisableWTMReportMessage,
} from '@whotracksme/webextension-packages/packages/serp-report/src/background/serp-report.js';

import WTMTrackerWheel from '/vendor/@whotracksme/ui/src/tracker-wheel.js';

import Options from '/store/options.js';

import trackers from './trackers.js';
import isBug from './bugs-matcher.js';
import tabStats from './tab-stats.js';
import {
  adblockerOnMessage,
  updateAdblockerEngineStatuses,
} from './adblocker.js';

import './stats.js';

function getTrackerFromUrl(url, origin) {
  try {
    const bugId = isBug(url);
    let trackerId = null;
    let tracker = null;

    if (bugId) {
      const { bugs, apps } = trackers.get('bugs');
      const appId = bugs[bugId].aid;
      const app = apps[appId];
      trackerId = app.trackerID;
      tracker = {
        id: app.trackerID,
        name: app.name,
        category: app.cat,
      };
    } else {
      const { domain } = parse(url);

      if (domain === origin) {
        return null;
      }

      trackerId = trackers.get('tracker_domains')[domain];
    }

    if (trackerId) {
      if (trackers.get('trackers')[trackerId]) {
        tracker = trackers.get('trackers')[trackerId];
      }
      if (!tracker.category && tracker.category_id) {
        tracker.category = trackers.get('categories')[tracker.category_id];
      }
      return tracker;
    }
  } catch (e) {
    return null;
  }

  return null;
}

// Refreshing the tracker wheel:
// * Immediately draw it when the first data comes in
// * After that, switch to debounced mode
//
// "immediate mode" will also be reentered after navigation events.
let updateIcon = updateIconNow;

function updateIconNow(tabId, stats) {
  const categories = stats.trackers.map((t) => t.category);
  const imageData = WTMTrackerWheel.offscreenImageData(128, categories);
  (chrome.browserAction || chrome.action).setIcon({
    tabId,
    imageData,
  });
  resetUpdateIconDebounceMode();
}

function resetUpdateIconImmediateMode() {
  if (updateIcon && updateIcon.cancel) {
    updateIcon.cancel();
  }
  updateIcon = updateIconNow;
}

function resetUpdateIconDebounceMode() {
  if (updateIcon && updateIcon.cancel) {
    updateIcon.cancel();
  }

  // effect: refresh 250ms after the last event, but force a refresh every second
  updateIcon = debounce(
    (...args) => {
      updateIconNow(...args);
    },
    250,
    {
      maxWait: 1000,
    },
  );
}

function userNavigatedToNewPage({ tabId, frameId, url }) {
  if (frameId !== 0) {
    return;
  }
  const { domain } = parse(url);
  if (!domain) {
    return;
  }
  tabStats.set(tabId, { domain, trackers: [], loadTime: 0 });
  resetUpdateIconImmediateMode();
}

chrome.webNavigation.onCommitted.addListener(userNavigatedToNewPage);

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStats.delete(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'dnrUpdate') {
    updateAdblockerEngineStatuses();
    return false;
  }

  if (sender.tab === undefined) {
    throw new Error('required "sender.tab" information is not available');
  }
  if (sender.tab.id === undefined) {
    throw new Error('required "sender.tab.id" information is not available');
  }
  if (sender.frameId === undefined) {
    throw new Error('required "sender.frameId" information is not available');
  }

  const tabId = sender.tab.id;

  // Workaround for Safari:
  // We cannot trust that Safari fires "chrome.webNavigation.onCommitted"
  // with the correct tabId (sometimes it is correct, sometimes it is 0).
  // Thus, let the content_script redundantly fire it.
  //
  // (Perhaps it is a bug in Safari. It can be triggered by opening
  //  a bookmarked page from a new tab.)
  if (msg.action === 'onCommitted') {
    if (sender.url === undefined) {
      throw new Error('required "sender.url" information is not available');
    }

    userNavigatedToNewPage({
      tabId,
      frameId: sender.frameId,
      url: sender.url,
    });
    return false;
  }

  const options = store.get(Options);

  if (msg.action === 'updateTabStats') {
    const stats = tabStats.get(tabId);
    const urls = msg.args[0].urls;
    if (msg.args[0].loadTime && sender.frameId === 0) {
      stats.loadTime = msg.args[0].loadTime;
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

    if (!options.trackerWheelDisabled) {
      // TODO: tracker stats can be empty (e.g. https://www.whotracks.me/).
      // If we render the icon, it will be empty. The if-guard has the
      // effect that in most cases, you will see Ghosty as the icon.
      // For the moment, that looks better then an empty icon. :-)
      if (stats.trackers.length > 0) {
        updateIcon(tabId, stats);
      }
    }

    return false;
  }

  if (options.wtmSerpReport ?? true) {
    if (tryWTMReportOnMessageHandler(msg, sender, sendResponse)) {
      return false;
    }
    if (isDisableWTMReportMessage(msg)) {
      store.set(options, { wtmSerpReport: false });

      return false;
    }
  }

  adblockerOnMessage(msg, sender, sendResponse);
  return false;
});
