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
import AnonymousCommunication from '@whotracksme/webextension-packages/packages/anonymous-communication';
import Reporting from '@whotracksme/webextension-packages/packages/reporting';

import { observe } from '/store/options.js';

function platformSpecificSettings() {
  if (
    /iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ) {
    // Ghostery extension for Safari on iOS and other Apple mobile devices
    return {
      ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
      PATTERNS_URL: 'https://cdn2.ghostery.com/wtm-safari-ios/patterns.json',
      CHANNEL: 'safari-ios',
    };
  }

  if (
    /Safari/i.test(navigator.userAgent) &&
    /Apple Computer/.test(navigator.vendor) &&
    !/Mobi|Android/i.test(navigator.userAgent)
  ) {
    // Ghostery extension for Safari on MacOS (Desktop)
    return {
      ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
      PATTERNS_URL:
        'https://cdn2.ghostery.com/wtm-safari-desktop/patterns.json',
      CHANNEL: 'safari-desktop',
    };
  }

  console.warn(
    'No matching config found. Falling back to patterns from Chrome Desktop.',
  );
  return {
    ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
    PATTERNS_URL: 'https://cdn2.ghostery.com/wtm-chrome-desktop/patterns.json',
    CHANNEL: 'ghostery',
  };
}

const COLLECTOR_DIRECT_URL = 'https://anonymous-communication.ghostery.net';
const COLLECTOR_PROXY_URL = COLLECTOR_DIRECT_URL; // current we have no proxy configured

const config = {
  COLLECTOR_DIRECT_URL,
  COLLECTOR_PROXY_URL,
  CONFIG_URL: 'https://api.ghostery.net/api/v1/config',
  ...platformSpecificSettings(),
};

class Storage {
  constructor(namespace) {
    this.namespace = `wtm::v1::${namespace}::`;
  }

  async get(key) {
    const prefixedKey = this.namespace + key;
    const result = await chrome.storage.local.get(prefixedKey);
    return result[prefixedKey];
  }

  async set(key, value) {
    const prefixedKey = this.namespace + key;
    return chrome.storage.local.set({ [prefixedKey]: value });
  }
}

const communication = new AnonymousCommunication({
  config,
  storage: new Storage('communication'),
});
const reporting = new Reporting({
  config,
  storage: new Storage('reporting'),
  communication,
});

observe('terms', (terms) => {
  if (terms) {
    reporting.init().catch((e) => {
      console.warn(
        'Failed to initialize reporting. Leaving the module disabled and continue.',
        e,
      );
    });
  } else {
    reporting.unload();
  }
});

chrome.webNavigation.onCommitted.addListener((details) => {
  const { url, frameId } = details;
  if (frameId !== 0 || url === 'about:blank' || url.startsWith('chrome://')) {
    return;
  }

  // TODO: in private windows, we should also exit (how to get the information?)

  (async () => {
    try {
      const jobRegistered = await reporting.analyzeUrl(url);
      if (jobRegistered) {
        // TODO: This part here is not robust:
        // we should avoid timers in MV3 or at least assume that we the service
        // worker will die (persisting the jobs and shift the scheduling
        // responsibility into the reporting module itself could help)
        const delay = ({ timeInMs }) => {
          return new Promise((resolve) => setTimeout(resolve, timeInMs));
        };
        await delay({ timeInMs: 2000 + 3000 * Math.random() });

        await reporting.processPendingJobs();
      }
    } catch (e) {
      console.warn('Unexpected error in reporting module:', e);
    }
  })();
});

// for debugging service-workers (TODO: provide a way to control logging)
self.ghostery = self.ghostery || {};
self.ghostery.WTM = {
  communication,
  reporting,
  config,
};
