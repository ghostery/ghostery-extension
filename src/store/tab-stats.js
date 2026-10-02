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

import Organization from './organization.js';

// Stats are saved per tab, and removed when the tab is closed (or the browser restarts)
const STORAGE_KEY_PREFIX = 'tabStats:';

// The background is the only context writing the stats, and it keeps
// the latest values in memory, so it must not follow the storage changes
let isWriter = false;

// The organization is saved by its id, so it is resolved when the stats are read
function serialize(stats) {
  return JSON.parse(
    JSON.stringify(stats, (key, value) => (key === 'organization' ? value?.id : value)),
  );
}

// Trackers are not enumerable, as the same tracker has different stats in each tab
const Tracker = {
  key: '',
  name: '',
  category: '',
  categoryDescription: '',
  organization: Organization,
  // Saved separately, as the listed requests are limited, and the oldest ones are removed
  blocked: false,
  modified: false,
  requests: [{ requestId: '', url: '', blocked: false, modified: false }],
  requestsCount: 0,
  requestsBlocked: ({ requests }) => requests.filter((r) => r.blocked),
  requestsModified: ({ requests }) => requests.filter((r) => r.modified),
  requestsObserved: ({ requests }) => requests.filter((r) => !r.blocked && !r.modified),
};

const TabStats = {
  id: true,
  domain: '',
  hostname: '',
  url: '',
  createdAt: 0,
  updatedAt: 0,
  incognito: false,
  trackers: [Tracker],

  displayHostname: ({ hostname }) => {
    hostname = hostname.replace(/^www\./, '');
    return hostname.length > 24 ? '...' + hostname.slice(-24) : hostname;
  },

  trackersBlocked: ({ trackers }) =>
    trackers.reduce((acc, { blocked }) => acc + Number(blocked), 0),
  trackersModified: ({ trackers }) =>
    trackers.reduce((acc, { modified }) => acc + Number(modified), 0),
  groupedTrackers: ({ trackers }) =>
    Object.entries(
      trackers.reduce(
        (categories, tracker) => ({
          ...categories,
          [tracker.category]: [...(categories[tracker.category] || []), tracker],
        }),
        {},
      ),
    ),
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
      ...Array(counts.slice(5).reduce((acc, [, count]) => acc + count, 0)).fill('other'),
    ];
  },

  [store.connect]: {
    async get(id) {
      const key = STORAGE_KEY_PREFIX + id;
      const { [key]: stats } = await chrome.storage.session.get(key);

      // Trackers are displayed in the order of their categories
      stats?.trackers.sort(sortCategories((t) => t.category));

      return stats ?? null;
    },
    set(id, values) {
      isWriter = true;

      // A new instance is created without the id argument, but its values have it
      const key = STORAGE_KEY_PREFIX + (id ?? values.id);

      (values
        ? chrome.storage.session.set({ [key]: serialize(values) })
        : chrome.storage.session.remove(key)
      ).catch((e) => console.error('[tab-stats] Failed to save stats', e));

      return values;
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
