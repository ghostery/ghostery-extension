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

import AnonymousCommunication from '@whotracksme/webextension-packages/packages/anonymous-communication';
import Reporting from '@whotracksme/webextension-packages/packages/reporting';
import * as IDB from 'idb';

import { observe } from '/store/options.js';

function platformSpecificSettings() {
  if (
    /iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ) {
    // Ghostery extension for Safari on iOS and other Apple mobile devices
    return {
      ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
      PATTERNS_URL: 'https://cdn2.ghostery.com/wtm-safari-ios/patterns.json',
      CHANNEL: 'safari-ios',
    };
  }

  if (
    /Safari/i.test(navigator.userAgent) &&
    /Apple Computer/.test(navigator.vendor) &&
    !/Mobi|Android/i.test(navigator.userAgent)
  ) {
    // Ghostery extension for Safari on MacOS (Desktop)
    return {
      ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
      PATTERNS_URL:
        'https://cdn2.ghostery.com/wtm-safari-desktop/patterns.json',
      CHANNEL: 'safari-desktop',
    };
  }

  console.warn(
    'No matching config found. Falling back to patterns from Chrome Desktop.',
  );
  return {
    ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
    PATTERNS_URL: 'https://cdn2.ghostery.com/wtm-chrome-desktop/patterns.json',
    CHANNEL: 'ghostery',
  };
}

const COLLECTOR_DIRECT_URL = 'https://anonymous-communication.ghostery.net';
const COLLECTOR_PROXY_URL = COLLECTOR_DIRECT_URL; // current we have no proxy configured

const config = {
  COLLECTOR_DIRECT_URL,
  COLLECTOR_PROXY_URL,
  CONFIG_URL: 'https://api.ghostery.net/api/v1/config',
  ...platformSpecificSettings(),
};

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
class Storage {
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
    this._dbName = dbName;
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

function prefixedIndexedDBKeyValueStore(namespace) {
  return (dbName, options) => {
    return new IndexedDBKeyValueStore(`wtm::${namespace}::${dbName}`, options);
  };
}

const communication = new AnonymousCommunication({
  config,
  storage: new Storage('communication'),
  connectDatabase: prefixedIndexedDBKeyValueStore('communication'),
});
const reporting = new Reporting({
  config,
  storage: new Storage('reporting'),
  communication,
});

observe('terms', (terms) => {
  if (terms) {
    reporting.init().catch((e) => {
      console.warn(
        'Failed to initialize reporting. Leaving the module disabled and continue.',
        e,
      );
    });
  } else {
    reporting.unload();
  }
});

function delay(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

function onLocationChange(details) {
  if (!reporting.isActive) return;

  const { url, frameId, tabId } = details;
  if (frameId !== 0 || url === 'about:blank' || url.startsWith('chrome://')) {
    return;
  }

  (async () => {
    // Be aware that the documentation of webNavigation.onCommitted is incomplete
    // (https://developer.chrome.com/docs/extensions/reference/webNavigation/#event-onCommitted):
    //
    // > Fired when a navigation is committed. The document (and the resources
    // > it refers to, such as images and subframes) might still be downloading,
    // > but at least part of the document has been received from the server and
    // > the browser has decided to switch to the new document.
    //
    // In practice, the event may also trigger for prefetch requests for which
    // no tab exists. For instance, it can be reproduced in Chrome by starting
    // a Google search from the address bar. Under certain conditions, the first
    // search result triggers an extra onCommitted event (even if the user didn't
    // click on the link yet).
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (!tab) {
      return;
    }

    // Don't leak information in private tabs (neither by storing on disk nor
    // by initiating HTTP requests).
    if (tab.incognito) {
      return;
    }

    try {
      const jobRegistered = await reporting.analyzeUrl(url);
      if (jobRegistered) {
        // TODO: This part here is not robust:
        // we should avoid timers in MV3 or at least assume that we the service
        // worker will die (persisting the jobs and shift the scheduling
        // responsibility into the reporting module itself could help)
        await delay(2000 + 3000 * Math.random());
        await reporting.processPendingJobs();
      }
    } catch (e) {
      console.warn('Unexpected error in reporting module:', e);
    }
  })();
}

chrome.webNavigation.onCommitted.addListener(onLocationChange);

if (__PLATFORM__ !== 'safari') {
  chrome.webNavigation.onHistoryStateUpdated.addListener(onLocationChange);
}

// for debugging service-workers (TODO: provide a way to control logging)
globalThis.ghostery = globalThis.ghostery || {};
globalThis.ghostery.WTM = {
  communication,
  reporting,
  config,
};
