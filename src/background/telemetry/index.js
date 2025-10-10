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

import Metrics, { processUrlQuery } from './metrics.js';

async function detectUTMs() {
  const tabs = await chrome.tabs.query({
    url: [
      'https://chromewebstore.google.com/detail/ghostery-*/mlomiejdfkolichcflejclcbmpeaniij*',
      'https://chrome.google.com/webstore/detail/ghostery-*/mlomiejdfkolichcflejclcbmpeaniij*',
      'https://microsoftedge.microsoft.com/addons/detail/ghostery-*/fclbdkbhjlgkbpfldjodgjncejkkjcme*',
      'https://addons.mozilla.org/*/firefox/addon/ghostery/*',
      'https://addons.opera.com/*/extensions/details/ghostery/*',
      'https://apps.apple.com/app/apple-store/id6504861501/*',
      'https://apps.apple.com/*/app/ghostery-*/id6504861501*',
      'https://www.ghostery.com/*',
      'https://www.ghosterystage.com/*',
    ],
  });

  // find first ghostery.com tab with utm_source and utm_campaign
  for (const tab of tabs) {
    const query = processUrlQuery(tab.url);

    if (query.utm_source && query.utm_campaign) {
      return query;
    }
  }

  return {};
}

async function saveStorage(storage) {
  await chrome.storage.local.set({ metrics: storage });
}

let runner;
const setup = asyncSetup('telemetry', [
  (async () => {
    const { version } = chrome.runtime.getManifest();
    const { metrics = {} } = await chrome.storage.local.get(['metrics']);

    if (!metrics.installDate) {
      metrics.installDate = new Date().toISOString().split('T')[0];

      const utms = await detectUTMs();
      metrics.utm_source = utms.utm_source || '';
      metrics.utm_campaign = utms.utm_campaign || '';

      saveStorage(metrics);
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
        userSettings: await chrome.action?.getUserSettings?.(),
      }),
      log: console.log.bind(console, '[telemetry]'),
    });
  })(),
]);

let enabled = false;
OptionsObserver.addListener(async function telemetry({ terms, feedback }) {
  enabled = terms && feedback;

  if (terms) {
    setup.pending && (await setup.pending);

    if (runner.isJustInstalled()) {
      runner.ping('install');
    }

    if (feedback) runner.ping('active');

    runner.setUninstallUrl();
  } else {
    chrome.runtime.setUninstallURL('https://mygho.st/fresh-uninstalls');
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (enabled && msg.action === 'telemetry') {
    Promise.resolve(setup.pending).then(() => runner.ping(msg.event));
  }
});
