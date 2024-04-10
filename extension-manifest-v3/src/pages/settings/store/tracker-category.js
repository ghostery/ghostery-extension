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

import TrackerException from '/store/tracker-exception.js';

import { getCategories, isCategoryBlockedByDefault } from '/utils/trackerdb.js';

const categories = getCategories();

const Tracker = {
  id: true,
  name: '',
  exception: TrackerException,
  organization: {
    name: '',
  },
};

export default {
  id: true,
  key: '',
  name: '',
  description: '',
  trackers: [Tracker],
  blockedByDefault: ({ key }) => isCategoryBlockedByDefault(key),
  blocked: ({ trackers, blockedByDefault }) => {
    let count = blockedByDefault ? trackers.length : 0;

    for (const tracker of trackers) {
      if (tracker.exception && tracker.exception.overwriteStatus) {
        count = blockedByDefault ? count - 1 : count + 1;
      }
    }

    return count;
  },
  trusted: ({ trackers, blockedByDefault }) => {
    let count = !blockedByDefault ? trackers.length : 0;

    for (const tracker of trackers) {
      if (tracker.exception && tracker.exception.overwriteStatus) {
        count = blockedByDefault ? count + 1 : count - 1;
      }
    }

    return count;
  },
  [store.connect]: {
    async list({ query }) {
      // Prefetch all of the exceptions from local storage
      await store.resolve([TrackerException]);

      const result = (await categories).map((category) => ({
        id: { key: category.key, query },
        key: category.key,
        name: category.name,
        description: category.description,
        trackers: category.patterns.map((pattern) => {
          return {
            id: pattern.key,
            name: pattern.name,
            organization: pattern.organization || {},
            exception: pattern.key,
          };
        }),
      }));

      if (query) {
        return result
          .map((category) => ({
            ...category,
            trackers: category.trackers.filter(
              (t) =>
                t.name.toLowerCase().includes(query) ||
                t.organization.name?.toLowerCase().includes(query),
            ),
          }))
          .filter((category) => category.trackers.length);
      }

      return result;
    },
  },
};
