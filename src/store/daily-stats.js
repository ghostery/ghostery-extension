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
import * as IDB from 'idb';

import { order } from '/ui/categories.js';

import { registerDatabase } from '/utils/indexeddb.js';
import * as trackerDb from '/utils/trackerdb.js';

import Tracker from './tracker.js';

// Synchronously register name of the database
// so if a user don't open any page, it is still possible
// to delete the database from settings page
const DB_NAME = registerDatabase('insights');

async function getDb() {
  if (!getDb.current) {
    getDb.current = IDB.openDB(DB_NAME, 31, {
      async upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion >= 20) {
          db.deleteObjectStore('search');
        }

        if (oldVersion === 30) {
          db.deleteObjectStore('tabs');
        }

        if (oldVersion < 31) {
          const daily =
            oldVersion < 1
              ? db.createObjectStore('daily', { keyPath: 'day' })
              : transaction.objectStore('daily');

          daily.createIndex('day', 'day', { unique: true });
        }
      },
      async blocking() {
        const db = await getDb.current;

        db.close();
        getDb.current = null;
      },
    });
  }

  return await getDb.current;
}

// Keep postponing the flush until the stats are not updated
// with a second of delay
const flushes = new Map();
async function flush(id) {
  clearTimeout(flushes.get(id));

  flushes.set(
    id,
    setTimeout(async () => {
      try {
        const values = await store.get(DailyStats, id);

        const db = await getDb();
        await db.put('daily', values);
      } catch (e) {
        console.error(`[daily-stats] Error while flushing daily stats`, e);
      }

      flushes.delete(id);
    }, 1000),
  );
}

const DailyStats = {
  id: true,
  day: '',
  trackersBlocked: 0,
  trackersModified: 0,
  pages: 0,
  patterns: [String],
  [store.connect]: {
    loose: true,
    async get(id) {
      const db = await getDb();
      return (await db.get('daily', id)) || { id, day: id };
    },
    set(id, values) {
      flush(id);
      return values;
    },
    async list({ dateFrom, dateTo }) {
      const db = await getDb();
      return db.getAllFromIndex(
        'daily',
        'day',
        IDBKeyRange.bound(dateFrom, dateTo),
      );
    },
  },
};

export default DailyStats;

export const MergedStats = {
  id: true,
  pages: 0,
  trackersBlocked: 0,
  trackersModified: 0,
  trackers: [String],
  groupedTrackers: [Tracker],
  categories: [String],
  groupedCategories: [{ id: true, count: 0 }],
  [store.connect]: {
    cache: false,
    async get({ dateFrom, dateTo }) {
      const list = await store.resolve([DailyStats], { dateFrom, dateTo });
      const patterns = [];

      const data = list.reduce(
        (acc, stats) => {
          for (const id of stats.patterns) {
            patterns.push(id);
          }

          acc.pages += stats.pages;
          acc.trackersBlocked += stats.trackersBlocked;
          acc.trackersModified += stats.trackersModified;

          return acc;
        },
        {
          pages: 0,
          trackersBlocked: 0,
          trackersModified: 0,
          categories: [],
        },
      );

      data.trackers = Array.from(new Set(patterns));

      const groupedCategories = {};
      const groupedTrackers = new Map();

      for (const id of patterns) {
        const tracker = await trackerDb.getTracker(id);

        const category = tracker?.category || 'unidentified';
        groupedCategories[category] = (groupedCategories[category] || 0) + 1;
        data.categories.push(category);

        if (tracker) {
          groupedTrackers.set(tracker, (groupedTrackers.get(tracker) || 0) + 1);
        }
      }

      data.groupedTrackers = Array.from(groupedTrackers.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([tracker]) => tracker);

      data.groupedCategories = Object.entries(groupedCategories)
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

      return data;
    },
  },
};
