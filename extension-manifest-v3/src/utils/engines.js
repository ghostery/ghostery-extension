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
import {
  FiltersEngine,
  ENGINE_VERSION,
  getLinesWithFilters,
  mergeDiffs,
  Config,
} from '@cliqz/adblocker';

import { registerDatabase } from '/utils/indexeddb.js';

export const COSMETIC_ENGINE = 'custom-filters-cosmetic';
export const NETWORK_ENGINE = 'custom-filters-network';

const engines = new Map();

function loadFromMemory(name) {
  return engines.get(name);
}

function saveToMemory(name, engine) {
  engines.set(name, engine);
}

// custom filter exceptions should apply to all engines
function shareExceptions(name, engine) {
  if (name.startsWith('custom-filters')) {
    return;
  }

  // Network exceptions
  const matchExceptions = engine.exceptions.match.bind(engine.exceptions);
  engine.exceptions.match = (...args) => {
    return (
      matchExceptions(...args) || get(NETWORK_ENGINE).exceptions.match(...args)
    );
  };

  // Cosmetic exceptions
  const iterMatchingFiltersUnhide =
    engine.cosmetics.unhideIndex.iterMatchingFilters.bind(
      engine.cosmetics.unhideIndex,
    );
  engine.cosmetics.unhideIndex.iterMatchingFilters = (...args) => {
    iterMatchingFiltersUnhide(...args);
    get(NETWORK_ENGINE).cosmetics.unhideIndex.iterMatchingFilters(...args);
  };

  const matchAllUnhideExceptions = engine.hideExceptions.matchAll.bind(
    engine.hideExceptions,
  );
  engine.hideExceptions.matchAll = (...args) => {
    return (
      matchAllUnhideExceptions(...args) ||
      get(COSMETIC_ENGINE).hideExceptions.matchAll(...args)
    );
  };
}

const DB_NAME = registerDatabase('engines');

async function getDB() {
  if (!getDB.current) {
    getDB.current = IDB.openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore('engines');
      },
      async blocking() {
        const db = await getDB.current;
        db.close();
        getDB.current = null;
      },
    });
  }

  return getDB.current;
}

async function loadFromStorage(name) {
  try {
    const db = await getDB();

    const tx = db.transaction('engines');
    const table = tx.objectStore('engines');

    const engineBytes = await table.get(name);

    if (engineBytes) {
      const engine = FiltersEngine.deserialize(engineBytes);
      shareExceptions(name, engine);
      saveToMemory(name, engine);

      return engine;
    }
  } catch (e) {
    console.error(`Failed to load engine "${name}" from storage`, e);
  }

  return null;
}

async function saveToStorage(name) {
  try {
    const engine = loadFromMemory(name);
    const db = await getDB();

    const tx = db.transaction('engines', 'readwrite');
    const table = tx.objectStore('engines');

    await table.put(engine.serialize(), name);
  } catch (e) {
    console.error(`Failed to save engine "${name}" to storage`, e);
  }
}

function check(response) {
  if (!response.ok) {
    throw new Error(
      `Failed to fetch engine "${name}": ${response.status}: ${response.statusText}`,
    );
  }

  return response;
}

async function update(name) {
  if (name.startsWith('custom-filters')) {
    return;
  }
  try {
    const urlName =
      name === 'trackerdb'
        ? 'trackerdbMv3'
        : `dnr${__PLATFORM__ === 'firefox' ? '' : '-cosmetics'}-${name}`;

    const data = await fetch(
      `https://cdn.ghostery.com/adblocker/configs/${urlName}/allowed-lists.json`,
    )
      .then(check)
      .then((res) => res.json());

    if (!data.engines[ENGINE_VERSION]) {
      throw new Error(
        `Engine "${name}" for "${ENGINE_VERSION}" engine version not found`,
      );
    }

    // Get current engine
    let engine = loadFromMemory(name);

    // Check if some lists need to be removed from the engine: either because
    // there are lists removed from allowed-lists.json or because some region
    // lists need to be disabled. In this case, we just reset the engine for
    // simplicity. Doing so also allows us to save memory because we do not have
    // to keep track of which filters belong to which list.
    //
    // We also make sure that all lists which need to be updated have an
    // available diff. If not, the operation would be equivalent to first
    // deleting the list then adding the new version. Because of this, we also
    // reset the engine if that happens.
    let foundListsToRemove = false;
    for (const [name, checksum] of engine.lists.entries()) {
      // If engine has a list which is not "enabled"
      if (!data.lists[name]) {
        foundListsToRemove = true;
        break;
      }

      // If engine has an out-dated list which does not have a diff available
      if (
        data.lists[name].checksum !== checksum &&
        data.lists[name].diffs[checksum] === undefined
      ) {
        foundListsToRemove = true;
        break;
      }
    }

    // Make a full update if we need to remove some lists
    if (foundListsToRemove) {
      const arrayBuffer = await fetch(data.engines[ENGINE_VERSION].url)
        .then(check)
        .then((res) => res.arrayBuffer());

      const engineBytes = new Uint8Array(arrayBuffer);
      engine = FiltersEngine.deserialize(engineBytes);

      shareExceptions(name, engine);
      // Save the new engine to memory and storage
      saveToMemory(name, engine);
      saveToStorage(name);

      console.log(`Engine "${name}" reloaded`);

      return engine;
    }

    // At this point we know that no list needs to be removed anymore. What
    // remains to be done is: *add new lists* and *update existing lists with
    // their respective diffs*.
    const diffs = [];

    /**
     * Helper function used to fetch a full list, parse it, accumulate
     * parsed filters, then update the checksum in engine if previous
     * steps were successful.
     */
    const fetchListToAdd = async ({ name, checksum, url }) => {
      try {
        // Create new diff and update version of the list in `this.engine`
        diffs.push({
          added: Array.from(
            getLinesWithFilters(
              await fetch(url)
                .then(check)
                .then((res) => res.text()),
              engine.config,
            ),
          ),
        });
        engine.lists.set(name, checksum);
      } catch (e) {
        console.error(`Failed to add list "${name}"`, e);
      }
    };

    /**
     * Helper function used to fetch a list diff, parse it, accumulate
     * parsed filters, then update the checksum in engine if previous
     * steps were successful.
     */
    const fetchListToUpdate = async ({ name, checksum, url }) => {
      try {
        // Create new diff and update version of the list in engine
        diffs.push(
          await fetch(url)
            .then(check)
            .then((res) => res.json()),
        );
        engine.lists.set(name, checksum);
      } catch (e) {
        console.error(`Failed to update list "${name}"`, e);
      }
    };

    // Go over enabled list and start fetching the ones which need to be added
    // or updated. All of this will happen concurrently.
    const promises = [];
    for (const name of Object.keys(data.lists)) {
      const checksum = engine.lists.get(name);
      if (checksum === undefined) {
        promises.push(
          fetchListToAdd({
            name,
            checksum: data.lists[name].checksum,
            url: data.lists[name].url,
          }),
        );
      } else if (checksum !== data.lists[name].checksum) {
        promises.push(
          fetchListToUpdate({
            name,
            checksum: data.lists[name].checksum,
            url: data.lists[name].diffs[checksum],
          }),
        );
      }
    }

    // Wait for all lists to have been fetched and parsed
    await Promise.all(promises);

    // `engine.update` method will return `true` if anything was
    // updated and `false` otherwise.
    const cumulativeDiff = mergeDiffs(diffs);
    let updated = engine.updateFromDiff(cumulativeDiff);

    // Last but not least, check if resources.txt should be updated. This can be
    // done independently of filters as the data is stored in a separate object.
    if (
      data.resources &&
      data.resources.checksum !== engine.resources.checksum
    ) {
      engine.updateResources(
        await fetch(data.resources.url)
          .then(check)
          .then((res) => res.text()),
        data.resources.checksum,
      );
      updated = true;
    }

    if (updated) {
      console.log(`Engine "${name}" updated`);
      // Save the new engine to storage
      saveToStorage(name);
    }

    return engine;
  } catch (e) {
    console.error(`Failed to update engine "${name}"`, e);
    throw e;
  }
}

export function updateAll() {
  return Promise.all(Array.from(engines.keys()).map((name) => update(name)));
}

async function loadFromDisk(name) {
  try {
    const response = await fetch(
      chrome.runtime.getURL(
        `rule_resources/engine-${name}${
          __PLATFORM__ === 'firefox' || name === 'trackerdb' ? '' : '-cosmetics'
        }.dat`,
      ),
    );

    const engineBytes = new Uint8Array(await response.arrayBuffer());
    const engine = FiltersEngine.deserialize(engineBytes);

    shareExceptions(name, engine);
    saveToMemory(name, engine);
    saveToStorage(name);

    // After initial load from disk, schedule an update
    // as it is done only once on the first run.
    // After loading from disk, it should be loaded from the storage
    update(name).catch(() => null);

    return engine;
  } catch (e) {
    console.error(`Failed to load engine "${name}" from disk`, e);
    return new FiltersEngine();
  }
}

export function get(name) {
  return loadFromMemory(name);
}

const ALARM_PREFIX = 'engines:update:';
const ALARM_DELAY = 60; // 1 hour

export async function init(name) {
  // Schedule an alarm to update engines once a day
  chrome.alarms.get(`${ALARM_PREFIX}${name}`, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(`${ALARM_PREFIX}${name}`, {
        delayInMinutes: ALARM_DELAY,
      });
    }
  });

  return (
    get(name) || (await loadFromStorage(name)) || (await loadFromDisk(name))
  );
}

async function createCustomEngine(name, filters = '') {
  const config = new Config({
    enableHtmlFiltering: true,
  });
  const engine = FiltersEngine.parse(filters, config);
  saveToMemory(name, engine);
  saveToStorage(name);
  return engine;
}

export async function initCustom(name, filters) {
  if (typeof filters === 'string') {
    return createCustomEngine(name, filters);
  }
  return (
    get(name) ||
    (await loadFromStorage(name)) ||
    (await createCustomEngine(name))
  );
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith(ALARM_PREFIX)) {
    const name = alarm.name.slice(ALARM_PREFIX.length);
    update(name).catch(() => null);

    chrome.alarms.create(alarm.name, {
      delayInMinutes: ALARM_DELAY,
    });
  }
});
