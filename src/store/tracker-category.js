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

import { getCategories } from '/utils/trackerdb.js';

import Tracker from './tracker.js';
import Options from './options.js';

const categories = getCategories();

export default {
  id: true,
  key: '',
  name: '',
  description: '',
  trackers: [Tracker],
  blockedByDefault: false,
  adjusted: ({ trackers }) =>
    trackers.reduce((count, tracker) => count + Number(tracker.adjusted), 0),
  [store.connect]: {
    async list({ query, filter }) {
      const result = (await categories).map((category) => ({
        id: { key: category.key, query, filter },
        ...category,
      }));

      if (query || filter) {
        const options = await store.resolve(Options);
        query = query.trim().toLowerCase();

        return result
          .map((category) => ({
            ...category,
            trackers: category.trackers.filter((t) => {
              const match =
                !query ||
                t.name.toLowerCase().includes(query) ||
                t.organization?.name.toLowerCase().includes(query);

              if (!match) return false;

              const exception = options.exceptions[t.id];

              switch (filter) {
                case 'blocked':
                  return !exception?.global;
                case 'trusted':
                  return exception?.global;
                case 'adjusted':
                  return exception;
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
