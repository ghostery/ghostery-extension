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

import { registerDatabase } from './indexeddb.js';
import debug from './debug.js';
import { captureException } from './errors.js';

export const CUSTOM_ENGINE = 'custom-filters';
export const REGIONAL_ENGINE = 'regional-filters';
export const FIXES_ENGINE = 'fixes';
export const TRACKERDB_ENGINE = 'trackerdb';

const engines = new Map();

const ENV = new Map([
  ['ext_ghostery', true],
  ['cap_html_filtering', checkUserAgent('Firefox')],
  // can be removed in once $replace support is sufficiently distributed
  ['cap_replace_modifier', checkUserAgent('Firefox')],
  ['env_firefox', checkUserAgent('Firefox')],
  ['env_chromium', checkUserAgent('Chrome')],
  ['env_edge', checkUserAgent('Edg')],
  ['env_mobile', checkUserAgent('Mobile')],
  ['env_experimental', false],
]);

export function setEnv(key, value) {
  if (ENV.has(key)) {
    ENV.set(key, value);

    for (const engine of engines.values()) {
      engine.updateEnv(ENV);
    }
  } else {
    throw Error(`Unknown environment variable: ${key}`);
  }
}

function checkUserAgent(pattern) {
  return navigator.userAgent.indexOf(pattern) !== -1;
}

function deserializeEngine(engineBytes) {
  const engine = FiltersEngine.deserialize(engineBytes);
  engine.updateEnv(ENV);

  return engine;
}

function loadFromMemory(name) {
  return engines.get(name);
}

function saveToMemory(name, engine) {
  engines.set(name, engine);
}

// custom filter exceptions should apply to all engines
function shareExceptions(name, engine) {
  if (name === CUSTOM_ENGINE || name === FIXES_ENGINE) return;

  // Network exceptions
  const matchExceptions = engine.exceptions.match.bind(engine.exceptions);
  engine.exceptions.match = (...args) => {
    return (
      get(CUSTOM_ENGINE).exceptions.match(...args) ||
      get(FIXES_ENGINE).exceptions.match(...args) ||
      matchExceptions(...args)
    );
  };

  // Cosmetic exceptions
  const iterMatchingFiltersUnhide =
    engine.cosmetics.unhideIndex.iterMatchingFilters.bind(
      engine.cosmetics.unhideIndex,
    );
  engine.cosmetics.unhideIndex.iterMatchingFilters = (...args) => {
    iterMatchingFiltersUnhide(...args);
    get(FIXES_ENGINE).cosmetics.unhideIndex.iterMatchingFilters(...args);
    get(CUSTOM_ENGINE).cosmetics.unhideIndex.iterMatchingFilters(...args);
  };

  const matchAllUnhideExceptions = engine.hideExceptions.matchAll.bind(
    engine.hideExceptions,
  );
  engine.hideExceptions.matchAll = (...args) => {
    return (
      matchAllUnhideExceptions(...args) ||
      get(FIXES_ENGINE).hideExceptions.matchAll(...args) ||
      get(CUSTOM_ENGINE).hideExceptions.matchAll(...args)
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
      const engine = deserializeEngine(engineBytes);
      shareExceptions(name, engine);
      saveToMemory(name, engine);

      return engine;
    }
  } catch (e) {
    const msg = e.message || '';

    if (
      // Adblocker core updates the engine version
      !msg.includes('serialized engine version mismatch') &&
      // Private Browsing mode in Firefox
      !msg.includes('database that did not allow mutations')
    ) {
      captureException(e);
    }

    console.error(`Failed to load engine "${name}" from storage`, e);
  }

  return null;
}

async function saveToStorage(name) {
  const engine = loadFromMemory(name);
  const db = await getDB();

  const tx = db.transaction('engines', 'readwrite');
  const table = tx.objectStore('engines');

  if (engine) {
    await table.put(engine.serialize(), name);
  } else {
    await table.delete(name);
  }
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
    const engine = deserializeEngine(engineBytes);
    shareExceptions(name, engine);
    saveToMemory(name, engine);
    saveToStorage(name)
      .then(() => {
        // After initial load from disk, schedule an update
        // as it is done only once on the first run.
        // After loading from disk, it should be loaded from the storage
        update(name).catch(() => null);
      })
      .catch(() => {
        console.error(`Failed to save engine "${name}" to storage`);
      });

    return engine;
  } catch (e) {
    console.error(`Failed to load engine "${name}" from disk`, e);
    return new FiltersEngine();
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

const updateListeners = new Map();
export function addUpdateListener(name, fn) {
  if (!updateListeners.has(name)) {
    updateListeners.set(name, new Set());
  }

  updateListeners.get(name).add(fn);
}

const CDN_HOSTNAME = chrome.runtime.getManifest().debug
  ? 'staging-cdn.ghostery.com'
  : 'cdn.ghostery.com';

async function update(name) {
  if (
    // Custom and regional engines are created on demand
    name === CUSTOM_ENGINE ||
    name === REGIONAL_ENGINE ||
    // If the IndexedDB is corrupted, and there is no way to load the engine
    // from storage, we should not try to update it
    (await loadFromStorage(name)) === null
  ) {
    return;
  }

  try {
    const urlName =
      name === 'trackerdb'
        ? 'trackerdbMv3'
        : `dnr${__PLATFORM__ === 'firefox' ? '' : '-cosmetics'}-${name}`;

    const listURL = `https://${CDN_HOSTNAME}/adblocker/configs/${urlName}/allowed-lists.json`;

    console.info(`Updating engine "${name}" from ${listURL}`);

    const data = await fetch(listURL)
      .then(check)
      .then((res) => res.json());

    if (!data.engines[ENGINE_VERSION]) {
      throw new Error(
        `Engine "${name}" for "${ENGINE_VERSION}" engine version not found`,
      );
    }

    // Get current engine
    let engine = loadFromMemory(name) || (await loadFromStorage(name));

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
      engine = deserializeEngine(engineBytes);
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
    let updated = engine.updateFromDiff(cumulativeDiff, ENV);

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

      // Notify listeners
      const fns = updateListeners.get(name);
      fns?.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.error(`Error while calling update listener for "${name}"`, e);
        }
      });

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

export function get(name) {
  return loadFromMemory(name);
}

const ALARM_PREFIX = 'engines:update:';
const ALARM_DELAY = 60; // 1 hour

export async function init(name) {
  if (__PLATFORM__ === 'tests') return;

  // Custom and regional engines are created on demand
  // And should not be updated by alarms
  if (name === CUSTOM_ENGINE || name === REGIONAL_ENGINE) {
    return (
      get(name) || (await loadFromStorage(name)) || (await createEngine(name))
    );
  }

  // Schedule an alarm to update engines once an hour
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

export async function clean(name) {
  engines.delete(name);
  chrome.alarms.clear(`${ALARM_PREFIX}${name}`);
}

export function createEngine(name, options = null) {
  const config = new Config({
    enableHtmlFiltering: ENV.get('cap_html_filtering'),
  });

  const engine = new FiltersEngine({ ...options, config });
  engine.updateEnv(ENV);

  saveToMemory(name, engine);
  saveToStorage(name).catch(() => {
    console.error(`Failed to save engine "${name}" to storage`);
  });

  return engine;
}

export function replaceEngine(name, engineOrEngines) {
  const engines = [].concat(engineOrEngines);
  const engine = engines.length > 1 ? FiltersEngine.merge(engines) : engines[0];

  saveToMemory(name, engine);
  saveToStorage(name).catch(() => {
    console.error(`Failed to save engine "${name}" to storage`);
  });

  return engine;
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

debug.engines = { get };
