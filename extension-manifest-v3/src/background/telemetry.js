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

import { Metrics as Telemetry } from '@ghostery/libs';
import { store } from 'hybrids';

import Options from '/store/options.js';

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

const getConf = async () => {
  const options = await store.resolve(store.get(Options));
  const install_date = new Date(options.onboarding.shownAt)
    .toISOString()
    .split('T')[0];
  return {
    enable_ad_block: Object.values(options.dnrRules).some((enabled) => enabled),
    enable_human_web: options.terms,
    install_date,
  };
};

(async () => {
  const storage = await loadStorage();

  const telemetry = new Telemetry({
    METRICS_BASE_URL: 'https://d.ghostery.com',
    EXTENSION_VERSION: chrome.runtime.getManifest().version,
    getConf,
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

  if (JUST_INSTALLED) {
    telemetry.setUninstallUrl();

    telemetry.ping('install');
  } else {
    telemetry.ping('active');
  }
})();
