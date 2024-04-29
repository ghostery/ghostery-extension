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

import { getCategories } from '/utils/trackerdb.js';
import Tracker from './tracker.js';

const categories = getCategories();

export default {
  id: true,
  key: '',
  name: '',
  description: '',
  trackers: [Tracker],
  blockedByDefault: false,
  blocked: ({ trackers, blockedByDefault }) =>
    trackers.reduce(
      (count, tracker) =>
        count +
        Number(
          store.ready(tracker.exception)
            ? tracker.exception.blocked
            : blockedByDefault,
        ),
      0,
    ),
  trusted: ({ trackers, blocked }) => trackers.length - blocked,
  [store.connect]: {
    async list({ query, filter }) {
      const exceptions = await store.resolve([TrackerException]);

      const result = (await categories).map((category) => ({
        id: { key: category.key, query, filter },
        ...category,
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

              const exception = exceptions.find((e) => e.id === t.id);
              const blocked = exception?.blocked ?? t.blockedByDefault;

              if (!match) return false;

              switch (filter) {
                case 'blocked':
                  return blocked;
                case 'trusted':
                  return !blocked;
                case 'adjusted':
                  return exception && exception.blocked !== t.blockedByDefault;
                default:
                  return true;
              }
            }),
          }))
          .filter((category) => category.trackers.length);
      }

      return result;
    },
  },
};
