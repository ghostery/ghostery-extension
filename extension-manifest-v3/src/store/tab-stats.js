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
import { parse } from 'tldts-experimental';

import AutoSyncingMap from '/utils/map.js';

import Tracker from './tracker.js';
import TrackerException from './tracker-exception.js';

const StatsTracker = {
  ...Tracker,
  blocked: false,
  modified: false,
  requests: [{ url: '', blocked: false, modified: false }],
  requestsCount: 0,
  requestsBlocked: ({ requests }) => requests.filter((r) => r.blocked),
  requestsModified: ({ requests }) => requests.filter((r) => r.modified),
  requestsObserved: ({ requests }) =>
    requests.filter((r) => !r.blocked && !r.modified),
};

const tab = await chrome.runtime.sendMessage({
  action: 'getCurrentTab',
});

const Stats = {
  hostname: '',
  trackers: [StatsTracker],
  trackersBlocked: ({ trackers }) =>
    trackers.reduce((acc, { blocked }) => acc + Number(blocked), 0),
  trackersModified: ({ trackers }) =>
    trackers.reduce((acc, { modified }) => acc + Number(modified), 0),

  categories: ({ trackers }) => trackers.map((t) => t.category),

  topCategories: ({ categories }) => {
    const counts = Object.entries(
      categories.reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),
    );

    if (counts.length < 6) return categories;

    return [
      ...counts
        .slice(0, 5)
        .map(([category, count]) => Array(count).fill(category))
        .flat(),
      ...Array(counts.slice(5).reduce((acc, [, count]) => acc + count, 0)).fill(
        'other',
      ),
    ];
  },

  [store.connect]: {
    async get() {
      if (!tab || !tab.url.startsWith('http')) {
        return {};
      }

      const tabStats = await AutoSyncingMap.get('tabStats:v1', tab.id);

      if (tabStats && tab.url.includes(tabStats.hostname)) {
        // Tracker has a reference to TrackerException,
        //so we need to resolve exceptions
        await store.resolve([TrackerException]);

        return tabStats;
      }

      const { hostname } = parse(tab.url);
      return { hostname };
    },
    observe:
      __PLATFORM__ === 'safari' &&
      (() => {
        setTimeout(() => store.clear(Stats, false), 1000);
      }),
  },
};

export default Stats;

if (__PLATFORM__ !== 'safari') {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes['tabStats:v1']) {
      store.clear(Stats, false);
    }
  });
}
