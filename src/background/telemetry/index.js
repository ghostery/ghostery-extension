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
import { debugMode } from '/utils/debug.js';
import asyncSetup from '/utils/setup.js';
import * as OptionsObserver from '/utils/options-observer.js';

import Metrics from './metrics.js';
import detectAttribution from './attribution.js';

export async function getStorage() {
  const { metrics } = await chrome.storage.local.get(['metrics']);
  return metrics || {};
}

async function saveStorage(metrics) {
  await chrome.storage.local.set({ metrics });
}

let runner;
const setup = asyncSetup('telemetry', [
  (async () => {
    const { version } = chrome.runtime.getManifest();
    const metrics = await getStorage();

    if (!metrics.installDate) {
      metrics.installDate = new Date().toISOString().split('T')[0];

      const attribution = await detectAttribution();
      metrics.utm_source = attribution.utm_source || '';
      metrics.utm_campaign = attribution.utm_campaign || '';

      await saveStorage(metrics);
    }

    runner = new Metrics({
      METRICS_BASE_URL: debugMode
        ? 'https://staging-d.ghostery.com'
        : 'https://d.ghostery.com',
      EXTENSION_VERSION: version,
      storage: metrics,
      saveStorage,
      getConf: async () => ({
        options: await store.resolve(Options),
        config: await store.resolve(Config),
        userSettings: await chrome.action?.getUserSettings?.(),
      }),
      log: console.log.bind(console, '[telemetry]'),
    });
  })(),
]);

let enabled = false;
OptionsObserver.addListener(async function telemetry(
  { terms, feedback, mode },
  lastOptions,
) {
  enabled = terms && feedback;

  if (terms) {
    setup.pending && (await setup.pending);

    if (runner.isJustInstalled()) {
      runner.ping('install');
    }

    if (feedback) runner.ping('active');

    runner.setUninstallUrl();

    if (lastOptions?.mode && lastOptions.mode !== mode) {
      runner.storage.modeTouched = true;
      await saveStorage(runner.storage);
    }
  } else {
    chrome.runtime.setUninstallURL('https://mygho.st/fresh-uninstalls');
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (enabled && msg.action === 'telemetry') {
    Promise.resolve(setup.pending).then(() => runner?.ping(msg.event));
  }

  if (msg.action === 'e2e:telemetry:setCookie') {
    chrome.cookies
      .set({
        url: msg.url,
        name: msg.name,
        value: msg.value,
      })
      .then(() => sendResponse('done'));
    return true;
  }

  if (msg.action === 'e2e:telemetry:removeCookie') {
    chrome.cookies
      .remove({
        url: msg.url,
        name: msg.name,
      })
      .then(() => sendResponse('done'));
    return true;
  }
});
