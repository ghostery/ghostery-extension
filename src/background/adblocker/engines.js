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

import Options, { ENGINES } from '/store/options.js';

import { isWebkit } from '/utils/browser-info.js';
import * as engines from '/utils/engines.js';
import * as trackerdb from '/utils/trackerdb.js';
import * as OptionsObserver from '/utils/options-observer.js';
import asyncSetup from '/utils/setup.js';

import { updateDNRRulesForExceptions } from '../exceptions.js';

import { contentScripts } from './content-scripts.js';

function getEnabledEngines(config) {
  if (config.terms) {
    const list = ENGINES.filter(({ key }) => config[key]).map(({ name }) => name);

    if (config.regionalFilters.enabled) {
      list.push(...config.regionalFilters.regions.map((id) => `lang-${id}`));
    }

    if (config.fixesFilters && list.length) {
      list.push(engines.FIXES_ENGINE);
    }

    list.push(engines.ELEMENT_PICKER_ENGINE);

    if (config.customFilters.enabled) {
      list.push(engines.CUSTOM_ENGINE);
    }

    return list;
  }

  return [];
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function reloadMainEngine() {
  // Delay the reload to avoid UI freezes in Firefox and Safari
  if (__FIREFOX__ || isWebkit()) await pause(1000);

  const options = await store.resolve(Options);
  const enabledEngines = getEnabledEngines(options);

  const resolvedEngines = (
    await Promise.all(
      enabledEngines.map((id) =>
        engines
          .init(id)
          .catch(() => {
            console.error(`[adblocker] failed to load engine: ${id}`);
            return null;
          })
          .then((engine) => {
            if (!engine) {
              enabledEngines.splice(enabledEngines.indexOf(id), 1);
            }
            return engine;
          }),
      ),
    )
  ).filter((engine) => engine);

  if (resolvedEngines.length) {
    engines.replace(engines.MAIN_ENGINE, resolvedEngines);

    console.info(`[adblocker] Main engine reloaded with: ${enabledEngines.join(', ')}`);
  } else {
    await engines.create(engines.MAIN_ENGINE);
    console.info('[adblocker] Main engine reloaded with no filters');
  }

  if (__FIREFOX__) {
    contentScripts.unregisterAll();
  }
}

let updating = false;
export async function updateEngines({ cache = true } = {}) {
  if (updating) return;

  try {
    updating = true;

    const options = await store.resolve(Options);
    const enabledEngines = getEnabledEngines(options);

    if (enabledEngines.length) {
      let updated = false;

      // Update engines from the list of enabled engines
      await Promise.all(
        enabledEngines.filter(engines.isPersistentEngine).map(async (id) => {
          await engines.init(id);
          updated = (await engines.update(id, { cache })) || updated;
        }),
      );

      // Update TrackerDB engine
      trackerdb.setup.pending && (await trackerdb.setup.pending);
      const trackerdbUpdated = await engines.update(engines.TRACKERDB_ENGINE, { cache });

      if (__CHROMIUM__ && trackerdbUpdated) {
        // We need to reload DNR rules for exceptions if TrackerDB engine is updated,
        // as rules rely on TrackerDB metadata
        await updateDNRRulesForExceptions();
      }

      // Update timestamp after the engines are updated
      await store.set(Options, { filtersUpdatedAt: Date.now() });

      if (updated) await reloadMainEngine();
    }
  } finally {
    updating = false;
  }
}

export const UPDATE_ENGINES_DELAY = 60 * 60 * 1000; // 1 hour
export const setup = asyncSetup('adblocker', [
  OptionsObserver.addListener(async function adblockerEngines(options, lastOptions) {
    const enabledEngines = getEnabledEngines(options);
    const lastEnabledEngines = lastOptions && getEnabledEngines(lastOptions);

    // Enabled engines changed (they might contain outdated filters)
    const enginesChanged =
      lastEnabledEngines &&
      (enabledEngines.length !== lastEnabledEngines.length ||
        enabledEngines.some((id, i) => id !== lastEnabledEngines[i]));

    // Reload main engine:
    // * when engine is not initialized or initialize fails (adblocker version mismatch)
    // * when enabled engines changed
    if (!(await engines.init(engines.MAIN_ENGINE)) || enginesChanged) {
      await reloadMainEngine();
    }

    // Update engine filters:
    // * when engines changed, so there might be re-enabled engines with outdated filters
    // * when filters are outdated (older than 1 hour)
    if (enginesChanged || options.filtersUpdatedAt < Date.now() - UPDATE_ENGINES_DELAY) {
      await updateEngines();
    }
  }),
]);
