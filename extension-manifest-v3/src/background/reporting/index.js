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

// TODO: This is a temporary solution to avoid throwing errors in Safari
import './safari-monkey-patch.js';

import AnonymousCommunication from '@whotracksme/webextension-packages/packages/anonymous-communication';
import {
  WebRequestPipeline,
  UrlReporter,
  RequestReporter,
  setLogLevel,
} from '@whotracksme/webextension-packages/packages/reporting';
import { getBrowserInfo } from '@ghostery/libs';

import prefixedIndexedDBKeyValueStore from './storage-indexeddb.js';
import Storage from './storage-chrome-local.js';
import Options, { observe } from '/store/options.js';
import Request from '../utils/request.js';
import { updateTabStats } from '../stats.js';
import asyncSetup from '../utils/setup.js';

const webRequestPipeline = new WebRequestPipeline();

// Important to call it in a first tick as it assigns chrome. listeners
webRequestPipeline.init();

setLogLevel('debug');

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

  if (navigator.userAgent.includes('Android')) {
    return {
      ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
      PATTERNS_URL:
        'https://cdn2.ghostery.com/wtm-ghostery-android/patterns.json',
      CHANNEL: 'android',
    };
  }

  console.warn(
    'No matching config found. Falling back to patterns from Chrome Desktop.',
  );
  const settings = {
    ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
    PATTERNS_URL: 'https://cdn2.ghostery.com/wtm-chrome-desktop/patterns.json',
    CHANNEL: 'ghostery',
  };

  if (
    navigator.userAgent.includes('Opera') &&
    navigator.userAgent.includes('YaBrowser') // same release channel as Opera
  ) {
    settings.CHANNEL = 'opera';
  }

  return settings;
}

const COLLECTOR_DIRECT_URL = 'https://anonymous-communication.ghostery.net';
const COLLECTOR_PROXY_URL = COLLECTOR_DIRECT_URL; // current we have no proxy configured

const config = {
  url: {
    COLLECTOR_DIRECT_URL,
    COLLECTOR_PROXY_URL,
    CONFIG_URL: 'https://api.ghostery.net/api/v1/config',
    SAFE_QUORUM_CONFIG_ENDPOINT:
      'https://safe-browsing-quorum.privacy.ghostery.net/config',
    ...platformSpecificSettings(),
  },
  request: {
    configUrl: 'https://cdn.ghostery.com/antitracking/config.json',
    remoteWhitelistUrl: 'https://cdn.ghostery.com/antitracking/whitelist/2',
    localWhitelistUrl: '/rule_resources/whotracksme',
  },
};

const communication = new AnonymousCommunication({
  config: config.url,
  storage: new Storage('communication'),
  connectDatabase: prefixedIndexedDBKeyValueStore('communication'),
});
const urlReporter = new UrlReporter({
  config: config.url,
  storage: new Storage('reporting'),
  connectDatabase: prefixedIndexedDBKeyValueStore('reporting'),
  communication,
});
let requestReporter = null;
let pausedDomains = [];
let isAntiTrackingEnabled = Options.blockTrackers;

if (__PLATFORM__ === 'firefox') {
  requestReporter = new RequestReporter(config.request, {
    webRequestPipeline,
    communication,
    countryProvider: urlReporter.countryProvider,
    trustedClock: communication.trustedClock,
    getBrowserInfo,
    isRequestAllowed: (state) => {
      if (!isAntiTrackingEnabled) {
        return true;
      }
      if (
        pausedDomains.some(
          ({ id }) => id === state.tabUrlParts.domainInfo.domain,
        )
      ) {
        return true;
      }
      return false;
    },
    onTrackerInteraction: (event, state) => {
      if (event === 'observed') {
        return;
      }

      const request = Request.fromRequestDetails({
        url: state.url,
        originUrl: state.tabUrl,
      });
      request.modified = true;

      updateTabStats(state.tabId, [request]);
    },
  });
}

const setup = asyncSetup([
  observe('terms', async (terms) => {
    if (terms) {
      await urlReporter.init().catch((e) => {
        console.warn(
          'Failed to initialize reporting. Leaving the module disabled and continue.',
          e,
        );
      });
      if (requestReporter) {
        await requestReporter.init();
      }
    } else {
      urlReporter.unload();
      if (requestReporter) {
        requestReporter.unload();
      }
    }
  }),
  observe('blockTrackers', (blockTrackers) => {
    isAntiTrackingEnabled = blockTrackers;
  }),
  observe('paused', (paused) => {
    pausedDomains = paused || [];
  }),
]);

async function onLocationChange(details) {
  try {
    setup.pending && (await setup.pending);
  } catch (e) {
    console.warn('Reporting is unavailable:', e);
    return;
  }

  if (!urlReporter.isActive) return;

  const { url, frameId, tabId } = details;
  if (frameId !== 0 || url === 'about:blank' || url.startsWith('chrome://')) {
    return;
  }

  // Be aware that the documentation of webNavigation.onCommitted is incomplete
  // (https://developer.chrome.com/docs/extensions/reference/webNavigation/#event-onCommitted):
  //
  // > Fired when a navigation is committed. The document (and the resources
  // > it refers to, such as images and subframes) might still be downloading,
  // > but at least part of the document has been received from the server and
  // > the browser has decided to switch to the new document.
  //
  // In practice, the event may also trigger for prefetch requests for which
  // no tab exists. For instance, it can be reproduced in Chrome by starting
  // a Google search from the address bar. Under certain conditions, the first
  // search result triggers an extra onCommitted event (even if the user didn't
  // click on the link yet).
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab) {
    return;
  }

  // Don't leak information in private tabs (neither by storing on disk nor
  // by initiating HTTP requests).
  if (tab.incognito) {
    return;
  }

  try {
    await urlReporter.analyzeUrl(url);
  } catch (e) {
    console.warn('Unexpected error in reporting module:', e);
  }
}

chrome.webNavigation.onCommitted.addListener((details) => {
  onLocationChange(details);
});

if (__PLATFORM__ !== 'safari') {
  chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    onLocationChange(details);
  });
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!requestReporter) {
    return;
  }
  if (msg.action === 'mousedown') {
    requestReporter.recordClick(msg.event, msg.context, msg.href, sender);
  }
});

// for debugging service-workers
globalThis.ghostery = globalThis.ghostery || {};
globalThis.ghostery.WTM = {
  communication,
  urlReporter,
  requestReporter,
  config,
  webRequestPipeline,
  extensionStartedAt: new Date(),
};
