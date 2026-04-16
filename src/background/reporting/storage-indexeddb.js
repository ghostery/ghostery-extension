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
   * Example:
   *
   * db.transaction({ readonly: false}, async (tx) => {
   *   let cursor = await tx.scan();
   *   while (cursor) {
   *     const { key, value } = cursor;
   *     cursor = await cursor.next();
   *   }
   *   const old = await tx.get('foo');
   *   await tx.set('foo', old + 1);
   * });
   */
  async transaction({ readonly }, cb) {
    if (readonly !== true && readonly !== false) {
      throw new Error('Usage: { readonly: false/true }');
    }
    await this.open();
    const tx = this._db.transaction(this._objectStore, readonly ? 'readonly' : 'readwrite');
    const wrappedTx = this._wrapTransaction(tx, { readonly });
    await cb(wrappedTx);
    await tx.done;
  }

  /**
   * Debug function (to workaround limitations in the devtools).
   * Do not use this function for production code! If you need to
   * iterate over a database, there are more efficient ways.
   */
  async _dumpToMap() {
    const keys = await this.keys();
    return new Map(await Promise.all(keys.sort().map(async (key) => [key, await this.get(key)])));
  }

  _wrapTransaction(tx, { readonly }) {
    const wrapper = {};

    // read operations:
    wrapper.get = (key) => tx.store.get(key);
    wrapper.scan = async () => this._wrapCursor(await tx.store.openCursor());

    // write operations:
    if (!readonly) {
      wrapper.set = (key, value) => tx.store.put(value, key);
      wrapper.remove = (key) => tx.store.delete(key);
      wrapper.clear = () => tx.store.clear();
    }

    return wrapper;
  }

  // Usage:
  //
  // let cursor = await tx.scan();
  // while (cursor) {
  //   const { key, value } = cursor.get();
  //   cursor = await cursor.next();
  // }
  _wrapCursor(cursor) {
    if (!cursor) {
      return null;
    }
    return {
      key: cursor.key,
      value: cursor.value,
      next: async () => this._wrapCursor(await cursor.continue()),
    };
  }
}

export default function prefixedIndexedDBKeyValueStore(namespace) {
  return (dbName, options) => {
    return new IndexedDBKeyValueStore(`wtm::${namespace}::${dbName}`, options);
  };
}
