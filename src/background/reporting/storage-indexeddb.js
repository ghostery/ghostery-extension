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

import * as IDB from 'idb';
import { registerDatabase } from '/utils/indexeddb.js';

/**
 * Provides a similar interface then Storage, but is based on IndexedDB.
 * See the comments in Storage to understand the pros and cons.
 *
 * TODO: Maybe implement a transparent fallback to an in-memory version instead
 * if IndexedDB is not working. Maybe configurable with an option in the
 * constructor. Even though an in-memory version is almost useless with
 * Manifest V3, it might be still better then throwing.
 */
class IndexedDBKeyValueStore {
  constructor(dbName, { version = 1, objectStore = 'default' } = {}) {
    this._dbName = registerDatabase(dbName);
    this._version = version;
    this._objectStore = objectStore;
  }

  async open() {
    if (!this._db) {
      const objectStore = this._objectStore;
      const dbName = this._dbName;
      const version = this._version;
      this._db = await IDB.openDB(this._dbName, this._version, {
        upgrade(db, oldVersion) {
          if (oldVersion >= 1) {
            console.warn(
              `Purging the content of the database ${dbName} because its version is outdated (${oldVersion} < ${version}).',
              '(This should only happen after an extension upgrade).`,
            );
            db.deleteObjectStore(objectStore);
          }
          db.createObjectStore(objectStore);
        },
      });
    }
  }

  async close() {
    try {
      if (this.db) {
        await this.db.close();
      }
    } finally {
      this.db = null;
    }
  }

  async get(key) {
    await this.open();
    return this._db.get(this._objectStore, key);
  }

  async set(key, value) {
    await this.open();
    return this._db.put(this._objectStore, value, key);
  }

  async remove(key) {
    await this.open();
    return this._db.delete(this._objectStore, key);
  }

  async clear() {
    await this.open();
    return this._db.clear(this._objectStore);
  }

  async keys() {
    await this.open();
    return this._db.getAllKeys(this._objectStore);
  }

  /**
   * Debug function (to workaround limitations in the devtools).
   * Do not use this function for production code! If you need to
   * iterate over a database, there are more efficient ways.
   */
  async _dumpToMap() {
    const keys = await this.keys();
    return new Map(
      await Promise.all(
        keys.sort().map(async (key) => [key, await this.get(key)]),
      ),
    );
  }
}

export default function prefixedIndexedDBKeyValueStore(namespace) {
  return (dbName, options) => {
    return new IndexedDBKeyValueStore(`wtm::${namespace}::${dbName}`, options);
  };
}
