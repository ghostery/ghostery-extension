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

import Options, { observe } from '/store/options.js';
import { debugMode } from '/utils/debug.js';

import Telemetry from './metrics.js';

const log = console.log.bind(console, '[telemetry]');

async function recordUTMs(telemetry, JUST_INSTALLED) {
  if (JUST_INSTALLED) {
    const { utm_source, utm_campaign } = await telemetry.detectUTMs();
    // persist campaign & source only
    await chrome.storage.local.set({ utms: { utm_campaign, utm_source } });
    return;
  }

  const { utms = {} } = await chrome.storage.local.get(['utms']);

  telemetry.setUTMs(utms);
}

const saveStorage = async (storage, metrics) => {
  Object.assign(storage, metrics);
  await chrome.storage.local.set({ metrics: storage });
};

const loadStorage = async () => {
  const storage = {
    active_daily_velocity: [],
    engaged_daily_velocity: [],
    engaged_daily_count: [],
  };
  Telemetry.FREQUENCY_TYPES.forEach((frequency) => {
    Telemetry.CRITICAL_TYPES.forEach((type) => {
      storage[`${type}_${frequency}`] = 0;
    });
  });
  const { metrics = {} } = await chrome.storage.local.get(['metrics']);
  Object.assign(storage, metrics);
  return storage;
};

const getConf = async (storage) => {
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
    setup_complete: options.onboarding.done && options.terms,
    setup_skip: options.onboarding.done && !options.terms,
    setup_timestamp: options.onboarding.shownAt,
    setup_shown: options.onboarding.shown,
  };
};

let telemetry;
let telemetryEnabled = false;

chrome.runtime.onMessage.addListener((msg) => {
  if (telemetryEnabled && msg.action === 'telemetry') {
    telemetry.ping(msg.event);
  }
});

(async () => {
  const storage = await loadStorage();
  const { version } = chrome.runtime.getManifest();

  telemetry = new Telemetry({
    METRICS_BASE_URL: debugMode
      ? 'https://staging-d.ghostery.com'
      : 'https://d.ghostery.com',
    EXTENSION_VERSION: version,
    getConf: () => getConf(storage),
    log,
    storage,
    saveStorage: (metrics) => {
      saveStorage(storage, metrics);
    },
  });

  const JUST_INSTALLED = storage.install_all === 0;

  try {
    await recordUTMs(telemetry, JUST_INSTALLED);
  } catch (error) {
    log('Telemetry recordUTMs() error', error);
  }

  observe('terms', async (terms) => {
    telemetryEnabled = terms;
    if (!terms) {
      return;
    }
    telemetry.ping('active');
    if (JUST_INSTALLED) {
      telemetry.ping('install');
    }
  });

  telemetry.setUninstallUrl();
})();
