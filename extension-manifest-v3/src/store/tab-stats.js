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

const Tracker = {
  id: true,
  name: '',
  requests: [{ url: '', blocked: false, modified: false }],
  category: 'unidentified',
  company: '',
  description: '',
  website: '',
  contact: '',
  privacyPolicy: '',
  requestsBlocked: ({ requests }) => requests.filter((r) => r.blocked),
  requestsModified: ({ requests }) => requests.filter((r) => r.modified),
  requestsObserved: ({ requests }) =>
    requests.filter((r) => !r.blocked && !r.modified),
};

const Stats = {
  domain: '',
  trackers: [Tracker],
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

  trackersBlocked: ({ trackers }) =>
    trackers.filter((tracker) => tracker.requestsBlocked.length),
  trackersModified: ({ trackers }) =>
    trackers.filter((tracker) => tracker.requestsModified.length),

  [store.connect]: {
    async get() {
      const tab = await chrome.runtime.sendMessage({
        action: 'getCurrentTab',
      });

      const storage = await chrome.storage.local.get(['tabStats:v1']);
      const stats = tab && storage['tabStats:v1']?.entries[tab.id];

      return stats && tab.url.includes(stats.domain) ? stats : {};
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
