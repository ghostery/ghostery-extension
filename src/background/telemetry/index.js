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
import Config from '/store/config.js';
import asyncSetup from '/utils/setup.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { getStorage, saveStorage } from '/utils/telemetry.js';

import Metrics from './metrics.js';
import detectAttribution from './attribution.js';

let runner;
const setup = asyncSetup('telemetry', [
  (async () => {
    const { version } = chrome.runtime.getManifest();
    const metrics = await getStorage();

    if (!metrics.installDate) {
      metrics.installDate = new Date().toISOString().split('T')[0];
      await saveStorage(metrics);
    }

    runner = new Metrics({
      METRICS_BASE_URL: __DEBUG__ ? 'https://staging-d.ghostery.com' : 'https://d.ghostery.com',
      EXTENSION_VERSION: version,
      storage: metrics,
      saveStorage,
      getConf: async () => ({
        options: await store.resolve(Options),
        config: await store.resolve(Config),
        userSettings: __CHROMIUM__ ? await chrome.action?.getUserSettings?.() : undefined,
        isAllowedIncognitoAccess: await chrome.extension.isAllowedIncognitoAccess(),
      }),
      log: console.debug.bind(console, '[telemetry]'),
    });
  })(),
]);

let enabled = false;
OptionsObserver.addListener(async function telemetry({ terms, feedback }, lastOptions) {
  // Update enabled state on every change
  enabled = terms && feedback;

  // Skip the rest of the logic for sequential runs after the first one
  // as the `terms` option can only by enabled once
  if (lastOptions && lastOptions.terms) return;

  if (terms) {
    setup.pending && (await setup.pending);

    if (runner.isJustInstalled()) {
      await runner.setUTMs(await detectAttribution());
      runner.ping('install');
    }

    runner.setUninstallUrl();
    if (feedback) runner.ping('active');
  } else {
    chrome.runtime.setUninstallURL('https://mygho.st/fresh-uninstalls');
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (enabled && msg.action.startsWith('telemetry:')) {
    (async () => {
      setup.pending && (await setup.pending);

      switch (msg.action) {
        case 'telemetry:ping':
          await runner.ping(msg.event);
          break;
        case 'telemetry:modeTouched': {
          runner.storage.modeTouched = true;
          await saveStorage(runner.storage);
          console.debug('[telemetry] "modeTouched" flag set');
          break;
        }
      }
    })();
  }
});
