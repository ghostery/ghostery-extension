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

export default {
  domain: '',
  all: 0,
  loadTime: 0,
  trackers: [
    {
      id: true,
      name: '',
      company_id: 'unknown',
      category: 'unknown',
    },
  ],
  byCategory: ({ trackers }) => {
    return trackers.reduce(
      (all, current) => ({
        ...all,
        [current.category]: {
          count: (all[current.category] || { count: 0 }).count + 1,
          trackers: [
            ...(all[current.category] || { trackers: [] }).trackers,
            current,
          ],
        },
      }),
      {},
    );
  },
  byTracker: ({ trackers }) => {
    return trackers.reduce(
      (all, current) => ({
        ...all,
        [current.id]: current,
      }),
      {},
    );
  },
  categories: ({ trackers }) => {
    return trackers.map((t) => t.category);
  },
  [store.connect]: {
    async get() {
      const currentTab = (
        await chrome.tabs.query({ active: true, currentWindow: true })
      )[0];
      const storage = await chrome.storage.local.get(['tabStats:v1']);

      if (!storage['tabStats:v1']) {
        throw Error('No stats found');
      }

      const tabStats = storage['tabStats:v1'].entries[currentTab.id];
      return tabStats;
    },
  },
};
