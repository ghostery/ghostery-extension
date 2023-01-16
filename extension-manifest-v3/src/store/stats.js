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

const supportsChangedListener =
  chrome.runtime.getManifest().manifest_version >= 3;

export const Company = {
  id: true,
  name: '',
  description: '',
  website: '',
  contact: '',
  privacyPolicy: '',
};

const Stats = {
  domain: '',
  trackers: [
    {
      id: true,
      name: '',
      category: 'unknown',
      company: Company,
      url: '',
    },
  ],
  byCategory: ({ trackers }) =>
    Object.entries(
      trackers.reduce((acc, tracker) => {
        const category = acc[tracker.category] || { count: 0, trackers: [] };

        const agg = category.trackers.find(({ name }) => name === tracker.name);
        if (agg) {
          agg.count += 1;
        } else {
          category.trackers.push({
            name: tracker.name,
            company: tracker.company,
            count: 1,
          });
        }

        category.count += 1;

        acc[tracker.category] = category;
        return acc;
      }, {}),
    ),
  categories: ({ trackers }) => trackers.map((t) => t.category),
  [store.connect]: {
    async get() {
      const currentTab = (
        await chrome.tabs.query({ active: true, currentWindow: true })
      )[0];

      const storage = await chrome.storage.local.get(['tabStats:v1']);

      if (!storage['tabStats:v1']) {
        throw Error('No stats found');
      }

      return storage['tabStats:v1'].entries[currentTab.id];
    },
    observe:
      !supportsChangedListener &&
      (() => {
        setTimeout(() => store.clear(Stats, false), 1000);
      }),
  },
};

if (supportsChangedListener) {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes['tabStats:v1']) {
      store.clear(Stats, false);
    }
  });
}

export default Stats;
