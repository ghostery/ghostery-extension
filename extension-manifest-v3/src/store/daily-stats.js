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

// Synchronously register name of the database
// so if a user don't open any page, it is still possible
// to delete the database from settings page
const DB_NAME = registerDatabase('insights');

async function getDb() {
  let upgradeFromMV2 = false;

  if (!getDb.current) {
    getDb.current = await IDB.openDB(DB_NAME, 31, {
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
      blocking() {
        getDb.current.close();
        getDb.current = null;
        upgradeFromMV2 = false;
      },
    });
  }

  if (upgradeFromMV2) {
    const db = getDb.current;
    const oldStats = await db.getAll('daily');
    const tx = db.transaction('daily', 'readwrite');
    const daily = tx.objectStore('daily');

    for (const stats of oldStats) {
      await daily.delete(stats.day);
      await daily.put({
        id: stats.day,
        day: stats.day,
        adsBlocked: stats.adsBlocked || 0,
        adsDetected: stats.adsBlocked || 0,
        trackersBlocked: stats.trackersBlocked || 0,
        trackersDetected: stats.trackersDetected || 0,
        requestsBlocked: stats.trackerRequestsBlocked || 0,
        requestsDetected: stats.trackerRequestsBlocked || 0,
        cookiesBlocked: stats.cookiesBlocked || 0,
        fingerprintsBlocked: stats.fingerprintsRemoved || 0,
        pages: stats.pages || 0,
        patterns: stats.trackers || [],
      });
    }

    await tx.done;
  }

  return getDb.current;
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
  adsBlocked: 0,
  adsDetected: 0,
  trackersBlocked: 0,
  trackersDetected: 0,
  requestsBlocked: 0,
  requestsDetected: 0,
  cookiesBlocked: 0,
  fingerprintsBlocked: 0,
  pages: 0,
  patterns: [String],
  [store.connect]: {
    async get(id) {
      const db = await getDb();
      return (await db.get('daily', id)) || { id, day: id };
    },
    set(id, values) {
      flush(id);
      return values;
    },
  },
};

export default DailyStats;

export async function getMergedStats(since) {
  const db = await getDb();
  const list = await db.getAllFromIndex('daily', 'day', since);

  const result = list.reduce(
    (acc, stats) => {
      for (const key of Object.keys(stats)) {
        if (key === 'id' || key === 'day') continue;

        if (key === 'patterns') {
          for (const id of stats.patterns) {
            acc.patterns.add(id);
          }
        } else {
          acc[key] = acc[key] + stats[key];
        }
      }

      return acc;
    },
    { ...DailyStats, patterns: new Set() },
  );

  // clean up model definition related properties
  delete result.id;
  delete result.day;
  delete result[store.connect];

  return Object.assign(result, { patterns: [...result.patterns] });
}
