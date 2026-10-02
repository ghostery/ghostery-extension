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

import { getOffscreenImageData } from '/ui/wheel.js';

import Options, { getPausedDetails, MODE_ZAP } from '/store/options.js';
import TabStats from '/store/tab-stats.js';

import { isOpera, isWebkit } from '/utils/browser-info.js';
import { isSerpSupported } from '/utils/opera.js';
import * as OptionsObserver from '/utils/options-observer.js';

const chromeAction = chrome.action || chrome.browserAction;

const { icons } = chrome.runtime.getManifest();

// We need to add a leading slash to the icon paths
if (__CHROMIUM__) {
  Object.keys(icons).forEach((key) => {
    icons[key] = `/${icons[key]}`;
  });
}

const inactiveIcons = Object.keys(icons).reduce((acc, key) => {
  acc[key] = icons[key].replace('.', '-inactive.');
  return acc;
}, {});

function setBadgeColor(color = '#3f4146' /* secondary */) {
  chromeAction.setBadgeBackgroundColor({ color });
}

OptionsObserver.addListener('terms', async function icon(terms) {
  if (!terms) {
    await chromeAction.setBadgeText({ text: '!' });
    setBadgeColor('#f13436' /* danger-500 */);
  } else {
    await chromeAction.setBadgeText({ text: '' });
    setBadgeColor();
  }
});

async function hasAccessToPage(tabId) {
  try {
    await chrome.scripting.insertCSS({ target: { tabId }, css: '' });
    return true;
  } catch {
    return false;
  }
}

async function refreshIcon(tabId) {
  const options = await store.resolve(Options);

  if (__CHROMIUM__ && isOpera() && options.terms) {
    isSerpSupported().then(async (supported) => {
      if (!supported) {
        setBadgeColor((await hasAccessToPage(tabId)) ? undefined : '#f13436' /* danger-500 */);
      }
    });
  }

  const stats = await store.resolve(TabStats, tabId);
  if (!stats.hostname) return;

  const paused = !!getPausedDetails(options, stats.hostname);
  const inactive = options.mode !== MODE_ZAP && (!options.terms || paused);

  const data = {};
  if (options.trackerWheel && stats.categories.length > 0) {
    data.imageData = getOffscreenImageData(128, stats.categories, { grayscale: inactive });
  } else {
    data.path = inactive ? inactiveIcons : icons;
  }

  // Note: Even in MV3, this is not (yet) returning a promise.
  chromeAction.setIcon({ tabId, ...data }, () => {
    if (chrome.runtime.lastError) {
      console.error(
        'setIcon failed for tabId',
        tabId,
        '(most likely the tab was closed)',
        chrome.runtime.lastError,
      );
    }
  });

  if (__FIREFOX__ || !isWebkit()) {
    try {
      await chromeAction.setBadgeText({
        tabId,
        text:
          options.trackerCount && (options.mode !== MODE_ZAP || !paused)
            ? String(Object.keys(stats.trackers).length)
            : '',
      });
    } catch (e) {
      console.error('Error while trying update the badge', e);
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
      __FIREFOX__ ? 1000 : 250,
    ),
  );

  refreshIcon(tabId);
}

store.observe(TabStats, (id, stats, lastStats) => {
  // Empty stats have nothing to show, and the tab might be already closed
  if (!stats?.hostname) return;

  // Model ids are strings, but the extension APIs require the tab id to be an integer
  const tabId = Number(id);

  if (stats.createdAt !== lastStats?.createdAt) {
    // A new page, or the stats loaded from the storage
    updateIcon(tabId, true);
  } else if (stats.categories.length !== lastStats.categories.length) {
    // We need to update the icon only if new categories were added
    updateIcon(tabId);
  }
});
