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

/**
 * A simple key-value storage built ontop of chrome.storage.local. If you need
 * to support more specific uses cases, use IndexedDBKeyValueStore instead.
 *
 * When should I use Storage and when IndexedDBKeyValueStore? In most cases it
 * is best to start with Storage. Only if you must, use the more complicated
 * IndexedDBKeyValueStore, for instance:
 * - You need to store huge values and are afraid that you may exceed
 *   the 5 MB limit of chrome.storage.local
 * - You need to efficiently store binary data
 * - You need to efficiently iterate over keys
 *
 * Note that even IndexedDBKeyValueStore might not be sufficient for advanced
 * use cases since it is a simplified key-value store. If you need the full
 * power of IndexedDB, you can either use its native APIs, or use a library
 * (e.g. IDB).
 */
export default class StorageLocal {
  constructor(namespace) {
    this.namespace = `wtm::v1::${namespace}::`;
  }

  async get(key) {
    const prefixedKey = this.namespace + key;
    const result = await chrome.storage.local.get(prefixedKey);
    return result[prefixedKey];
  }

  async set(key, value) {
    const prefixedKey = this.namespace + key;
    return chrome.storage.local.set({ [prefixedKey]: value });
  }

  async remove(key) {
    const prefixedKey = this.namespace + key;
    return chrome.storage.local.remove(prefixedKey);
  }

  /**
   * Should be used onyl for debugging. Note that Storage is not designed
   * to support efficient iteration over keys. If you need that, consider
   * using IndexedDBKeyValueStore.
   */
  async _dumpToMap() {
    return Object.entries(await chrome.storage.local.get()).filter(([key]) =>
      key.startsWith(this.namespace),
    );
  }
}
