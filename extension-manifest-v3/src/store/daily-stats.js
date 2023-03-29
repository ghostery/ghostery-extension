import { store } from 'hybrids';
import * as IDB from 'idb';

import { registerDatabase } from '/utils/indexeddb.js';

// Synchronously register name of the database
// so if a user don't open any page, it is still possible
// to delete the database from settings page
const DB_NAME = registerDatabase('stats');

async function getDb() {
  if (!getDb.current) {
    getDb.current = await IDB.openDB(DB_NAME, 1, {
      upgrade(db) {
        // Version 1
        const daily = db.createObjectStore('daily', { keyPath: 'id' });
        daily.createIndex('id', 'id', { unique: true });
      },
      blocking() {
        getDb.current.close();
        getDb.current = null;
      },
    });
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
  all: 0,
  allBlocked: 0,
  ads: 0,
  adsBlocked: 0,
  trackers: 0,
  trackersBlocked: 0,
  pages: 0,
  patterns: [String],
  [store.connect]: {
    get(id) {
      return { id };
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
  const list = await db.getAllFromIndex('daily', 'id', since);

  const result = list.reduce(
    (acc, stats) => {
      for (const key of Object.keys(stats)) {
        if (key === 'id') continue;

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
  delete result[store.connect];

  return Object.assign(result, { patterns: [...result.patterns] });
}
