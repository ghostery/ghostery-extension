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

import { sortCategories } from '/ui/categories.js';
import { safeForStorage } from '/utils/storage.js';

// Stats are saved per tab, and removed when the tab is closed (or the browser restarts)
const STORAGE_KEY_PREFIX = 'tabStats:';

// The background is the only context writing the stats, and it keeps
// the latest values in memory, so it must not follow the storage changes
let isWriter = false;

const TabStats = {
  id: true,
  domain: '',
  hostname: '',
  url: '',
  createdAt: 0,
  updatedAt: 0,
  incognito: false,

  // Trackers by their keys
  trackers: store.record({
    key: '',
    name: '',
    category: '',
    categoryDescription: '',
    // Resolved only by the views displaying the organization
    organization: '',
    // Saved separately, as the listed requests are limited, and the oldest ones are removed
    blocked: false,
    modified: false,
    requests: [{ requestId: '', url: '', blocked: false, modified: false }],
    requestsCount: 0,
    requestsBlocked: ({ requests }) => requests.filter((r) => r.blocked),
    requestsModified: ({ requests }) => requests.filter((r) => r.modified),
    requestsObserved: ({ requests }) => requests.filter((r) => !r.blocked && !r.modified),
  }),

  displayHostname: ({ hostname }) => {
    hostname = hostname.replace(/^www\./, '');
    return hostname.length > 24 ? '...' + hostname.slice(-24) : hostname;
  },

  trackersBlocked: ({ trackers }) =>
    Object.values(trackers).reduce((acc, { blocked }) => acc + Number(blocked), 0),
  trackersModified: ({ trackers }) =>
    Object.values(trackers).reduce((acc, { modified }) => acc + Number(modified), 0),

  // Trackers are displayed in the order of their categories
  groupedTrackers: ({ trackers }) =>
    Object.entries(
      Object.values(trackers).reduce(
        (categories, tracker) => ({
          ...categories,
          [tracker.category]: [...(categories[tracker.category] || []), tracker],
        }),
        {},
      ),
    ).sort(sortCategories(([category]) => category)),
  categories: ({ trackers }) =>
    Object.values(trackers)
      .map((t) => t.category)
      .sort(sortCategories()),
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
      ...Array(counts.slice(5).reduce((acc, [, count]) => acc + count, 0)).fill('other'),
    ];
  },

  [store.connect]: {
    async get(id) {
      const key = STORAGE_KEY_PREFIX + id;
      const { [key]: stats } = await chrome.storage.session.get(key);

      return stats ?? {};
    },
    set(id, values) {
      isWriter = true;

      const key = STORAGE_KEY_PREFIX + id;

      (values
        ? chrome.storage.session.set({ [key]: safeForStorage(values) })
        : chrome.storage.session.remove(key)
      ).catch((e) => console.error('[tab-stats] Failed to save stats', e));

      return values ?? { id };
    },
  },
};

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (isWriter || areaName !== 'session') return;

  if (Object.keys(changes).some((key) => key.startsWith(STORAGE_KEY_PREFIX))) {
    store.clear(TabStats, false);
  }
});

export default TabStats;
