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

import Options from '/store/options.js';
import { debugMode } from '/utils/debug.js';
import asyncSetup from '/utils/setup.js';
import * as OptionsObserver from '/utils/options-observer.js';

import Metrics from './metrics.js';

async function loadStorage() {
  const storage = {
    active_daily_velocity: [],
    engaged_daily_velocity: [],
    engaged_daily_count: [],
  };
  Metrics.FREQUENCY_TYPES.forEach((frequency) => {
    Metrics.CRITICAL_TYPES.forEach((type) => {
      storage[`${type}_${frequency}`] = 0;
    });
  });
  const { metrics = {} } = await chrome.storage.local.get(['metrics']);
  Object.assign(storage, metrics);
  return storage;
}

async function saveStorage(storage, metrics) {
  Object.assign(storage, metrics);
  await chrome.storage.local.set({ metrics: storage });
}

async function getConf(storage) {
  const options = await store.resolve(Options);

  // Historically install_data was stored in Options.
  // As it is used by telemetry only, it is here migrated
  // to telemetry storage.
  // TODO: cleanup Options after September 2024
  if (!storage.installDate) {
    saveStorage(storage, {
      installDate:
        options.installDate || new Date().toISOString().split('T')[0],
      installRandom: Math.floor(Math.random() * 100) + 1,
    });
  }

  return {
    enable_ad_block: options.blockAds,
    enable_anti_tracking: options.blockTrackers,
    enable_smart_block: options.blockAnnoyances,
    enable_human_web: options.terms,
    installDate: storage.installDate,
    installRandom: storage.installRandom,
    setup_shown: options.onboarding.shown,
  };
}

let metrics;
const setup = asyncSetup([
  (async () => {
    const storage = await loadStorage();
    const { version } = chrome.runtime.getManifest();

    metrics = new Metrics({
      METRICS_BASE_URL: debugMode
        ? 'https://staging-d.ghostery.com'
        : 'https://d.ghostery.com',
      EXTENSION_VERSION: version,
      getConf: () => getConf(storage),
      log: console.log.bind(console, '[telemetry]'),
      storage,
      saveStorage: (metrics) => {
        saveStorage(storage, metrics);
      },
    });

    // Just installed condition
    if (storage.install_all === 0) {
      const utms = await metrics.detectUTMs();
      await chrome.storage.local.set({ utms });
    } else {
      const { utms = {} } = await chrome.storage.local.get(['utms']);
      metrics.setUTMs(utms);
    }

    metrics.setUninstallUrl();
  })(),
]);

let enabled = false;
OptionsObserver.addListener('terms', async function telemetry(terms) {
  enabled = terms;

  if (terms) {
    setup.pending && (await setup.pending);
    metrics.ping('install');
    metrics.ping('active');
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (enabled && msg.action === 'telemetry') {
    (async () => {
      setup.pending && (await setup.pending);
      metrics.ping(msg.event);
    })();
  }
});
