/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 * https://www.whotracks.me/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

(function () {
  function log(/*...args*/) {
    //console.debug('[ghostery-prevent-indexeddb-tracking]', ...args);
  }

  // 'disable': remove the API (it does not exist on Firefox, so browser-independent code should be able to handle it)
  // 'hide-all': implement the API but always return an empty list (prevents tracking, but the side-effects are not clear)
  // 'hide-well-known-databases': like hide-all, but only hide some well-known databases (maybe more predicable, but may still break and still allow tracking)
  // 'try-to-open': (does not work) try to open the database and skip the ones that are not readable
  //                (assumes that WebKit rejects it if you try to open a databases cross-origin, but that is not the case)
  const METHOD = 'hide-well-known-databases';

  if (METHOD === 'disable') {
    log('Monkey patching: remove indexedDB.databases function');
    delete IDBFactory.prototype.databases;
  } else if (METHOD === 'hide-all') {
    log('Monkey patching indexedDB.databases() to always return []');
    IDBFactory.prototype.databases = async function () {
      log('Calling IDBFactory.prototype.databases (always return [])');
      return [];
    };
  } else if (METHOD === 'hide-well-known-databases') {
    log('Monkey patching indexedDB.databases() to hide well-known databases');
    const originalDatabasesPrototype = IDBFactory.prototype.databases;

    // the follow data is derived from the examples in the fingerprint.js prototype:
    // https://github.com/fingerprintjs/blog-indexeddb-safari-leaks-demo
    const PATTERNS = [
      /offline.settings.(\d+)/, // calendar.google.com
      /offline.requests.(\d+)/,
      /Keep-(\d+)/, // keep.google.com
      /LogsDatabaseV2:(\d+)\|\|/, // youtube.com
      /PersistentEntityStoreDb:(\d+)\|\|/,
      /yt-idb-pref-storage:(\d+)\|\|/,
      /yt-it-response-store:(\d+)\|\|/,
      /yt-player-local-media:(\d+)\|\|/,
      /offline.settings./,
      /offline.requests./,
      /storage.dfesw-/,
      /Keep-/,
      /LogsDatabaseV2:'/,
      /PersistentEntityStoreDb/,
      /yt-idb-pref-storage/,
      /yt-it-response-store/,
      /yt-player-local-media/,
    ];

    const EXACT = [
      'GoogleDocs',
      'DocsErrors',
      'GoogleDriveDs',
      'offline.users',
      'user_registry',
      'gmail-sw-keyval',
      'meet_db',
      'storage.bw.offline',
      'GoogleDriveDsImpressions',
      'dfesw-mss-cache-prod',
      'GoogleDriveDs',
      'devsite-index-db',
      'wawc',
      '__dbnames',
      'netflix.player',
      'yt-serviceworker-metadata',
      'ServiceWorkerAsyncStorage',
      'redux',
      'reduxPersistence',
      'sync',
      'localforage',
      'horizonweb',
      'sw_keyval_db',
      'apexMetrics',
      'unused',
      'flasher',
      'adjust-sdk',
      'anchor-website',
      'a2a5c7f9-3fa0-4182-889a-15aa61acf59b',
      '68547f8f-2fd8-4ff3-9b63-51e86e2edee8',
      '6b6b990e-d9d8-4116-a028-76da837d7607',
      '2a28082a-de31-45fd-a00c-548117e422f7',
      '3d2fb0bd-52fc-4b75-aaf5-2d436c172540',
      'b611f626-25c2-4182-ad7f-50a0ba61117b',
      'X3VhX3Nkazpxd1dXMHA1elRPaTdqUkRLVXZiSVdBOi8=:db',
      'bloomberg',
      'firebaseLocalStorageDb',
      'notifications',
      'theoplayer-cache-database',
      'cbc_storage',
      'firebase-installations-database',
      'AppboyServiceWorkerAsyncStorage',
      'firebaseLocalStorageDb',
      'Braze IndexedDB Support Test',
      'nerf-web',
      'wxu-web',
      'd2fb08da-1c03-4c8a-978f-ad8a96b4c31f',
      'X3VhX3NkazpYSm9DR1cwR1JEaWV0Z0VoRVhwc0pnOi8=:db',
      'XCloudAppLogs',
      '67cbf6c5-d926-407b-a684-a0606570ff08',
      '289d106c-df24-4cd9-a9fa-753e928c23ad',
      'f7e98148-cb09-4cf1-9b9f-b5aee3465d6e',
      '5d79bce7-5d2b-427e-a6c4-b89b6c7bf048',
      'f5b3be27-f789-4ef1-8867-37c67da5b361',
    ];

    const shouldBeHidden = function (name) {
      return EXACT.includes(name) || PATTERNS.some((p) => p.test(name));
    };

    IDBFactory.prototype.databases = async function () {
      log('Calling IDBFactory.prototype.databases (hide well-known databases)');
      const allDatabases = await originalDatabasesPrototype.apply(
        this,
        arguments,
      );
      return allDatabases.filter(({ name }) => !shouldBeHidden(name));
    };
  } else if (METHOD === 'try-to-open') {
    // Note: this does not work. Assuming Safari will throw an error if you try
    // to open databases cross-origin is sadly not true. Not exactly clear what
    // it does - you end up with duplicated databases - but it does not trigger
    // an error. Leaving it in for completeness, but it does not work:

    const originalDatabasesPrototype = IDBFactory.prototype.databases;
    const originalOpenPrototype = IDBFactory.prototype.open;

    const isReadable = (instanceDbInstance, name, version) => {
      return new Promise((resolve) => {
        const request = originalOpenPrototype.call(
          instanceDbInstance,
          name,
          version,
        );
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    };

    IDBFactory.prototype.databases = async function () {
      log(
        'Calling IDBFactory.prototype.databases to hide non-readable databases',
      );
      const instanceDbInstance = this;
      const allDatabases = await originalDatabasesPrototype.apply(
        instanceDbInstance,
        arguments,
      );
      const readableDatabases = await Promise.all(
        allDatabases.map(async ({ name, version }) => {
          if (await isReadable(instanceDbInstance, name, version)) {
            log(`Accepting database ${name}`);
            return { name, version };
          } else {
            log(`Skipping database ${name}`);
            return null;
          }
        }),
      );
      return readableDatabases.filter((x) => x);
    };
  } else {
    log('Unknown method: leaving everything as is');
  }
})();
