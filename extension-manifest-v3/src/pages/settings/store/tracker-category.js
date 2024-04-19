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

import { getCategories, isCategoryBlockedByDefault } from '../../../utils/trackerdb.js';
import Tracker from './tracker.js';

const categories = getCategories();

export default {
  id: true,
  key: '',
  name: '',
  description: '',
  trackers: [Tracker],
  blockedByDefault: true,
  blocked: ({ trackers, blockedByDefault }) =>
    trackers
      .filter((t) => t.exception.overwriteStatus)
      .reduce(
        (count) => (blockedByDefault ? count - 1 : count + 1),
        blockedByDefault ? trackers.length : 0,
      ),
  trusted: ({ trackers, blockedByDefault }) =>
    trackers
      .filter((t) => t.exception.overwriteStatus)
      .reduce(
        (count) => (blockedByDefault ? count + 1 : count - 1),
        !blockedByDefault ? trackers.length : 0,
      ),
  [store.connect]: {
    async list({ query, filter }) {
      const exceptions = await store.resolve([TrackerException]);

      const result = (await categories).map((category) => ({
        id: { key: category.key, query, filter },
        ...category,
        trackers: category.trackers.map((t) => {
          return {
            ...t,
            exception: exceptions.find((e) => e.id === t.id) || t.id,
          };
        }),
        blockedByDefault: isCategoryBlockedByDefault(category.key),
      }));

      if (query || filter) {
        query = query.trim().toLowerCase();

        return result
          .map((category) => ({
            ...category,
            trackers: category.trackers.filter((t) => {
              const match =
                !query ||
                t.name.toLowerCase().includes(query) ||
                t.organization?.name.toLowerCase().includes(query);

              return (
                match &&
                (!filter ||
                  (filter === 'blocked' &&
                    (t.exception.overwriteStatus || false) !==
                      category.blockedByDefault) ||
                  (filter === 'trusted' &&
                    (t.exception.overwriteStatus || false) ===
                      category.blockedByDefault))
              );
            }),
          }))
          .filter((category) => category.trackers.length);
      }

      return result;
    },
  },
};
