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

import { deleteDB } from 'idb';

const dbs = new Set();

export function registerDatabase(name) {
  dbs.add(name);
  return name;
}

export async function deleteDatabases() {
  const names = indexedDB.databases
    ? (await indexedDB.databases()).map((db) => db.name)
    : [...dbs];

  await Promise.allSettled(
    names.map((name) => {
      console.info(`[devtools] Deleting indexedDB database '${name}'`);

      return new Promise((resolve, reject) => {
        deleteDB(name, {
          blocked() {
            console.error(
              `[utils|indexeddb] Failed to delete database ${name} because it is blocked`,
            );
            reject();
          },
        }).then(resolve).catch(reject);
      });
    }),
  );
}
