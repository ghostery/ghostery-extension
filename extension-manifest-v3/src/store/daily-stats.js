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

import { registerDatabase } from '/utils/indexeddb.js';
import * as trackerDb from '/utils/trackerdb.js';

// Synchronously register name of the database
// so if a user don't open any page, it is still possible
// to delete the database from settings page
const DB_NAME = registerDatabase('insights');

async function getDb() {
  let upgradeFromMV2 = false;

  if (!getDb.current) {
    getDb.current = IDB.openDB(DB_NAME, 31, {
      async upgrade(db, oldVersion, newVersion, transaction) {
        upgradeFromMV2 = oldVersion > 0 && oldVersion < 31;

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
        upgradeFromMV2 = false;
      },
    });
  }

  if (upgradeFromMV2) {
    const db = await getDb.current;
    const oldStats = await db.getAll('daily');
    const tx = db.transaction('daily', 'readwrite');
    const daily = tx.objectStore('daily');

    console.log(
      `[daily-stats] Migrating ${oldStats.length} daily stats from MV2`,
    );

    for (const stats of oldStats) {
      await daily.delete(stats.day);
      await daily.put({
        id: stats.day,
        day: stats.day,
        trackersBlocked: stats.trackersBlocked || 0,
        trackersModified:
          (stats.cookiesBlocked || 0) + (stats.fingerprintsRemoved || 0),
        pages: stats.pages || 0,
        patterns: stats.trackers || [],
      });
    }

    await tx.done;

    console.log(
      `[daily-stats] Migration of daily stats from MV2 done successfully`,
    );
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
        console.error(`Error while flushing daily stats`, e);
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
    async list() {
      const db = await getDb();
      return db.getAllFromIndex('daily', 'day');
    },
  },
};

export default DailyStats;

export const MergedStats = {
  trackersBlocked: 0,
  trackersModified: 0,
  trackersDetailed: [{ id: true, category: '' }],
  [store.connect]: {
    cache: false,
    async get() {
      const list = await store.resolve([DailyStats]);
      const patterns = new Set();

      // Merge stats
      const mergedStats = list.reduce(
        (acc, stats) => {
          for (const id of stats.patterns) {
            patterns.add(id);
          }

          acc.trackersBlocked += stats.trackersBlocked;
          acc.trackersModified += stats.trackersModified;

          return acc;
        },
        {
          trackersBlocked: 0,
          trackersModified: 0,
          trackersDetailed: [],
        },
      );

      // Add metadata
      for (const id of patterns) {
        const { category = 'unidentified' } =
          (await trackerDb.getPattern(id)) || {};

        mergedStats.trackersDetailed.push({
          id,
          category,
        });
      }

      return mergedStats;
    },
  },
};
