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

import * as Sentry from '@sentry/browser';

import { observe } from '/store/options.js';

import getBrowserInfo from './browser-info.js';
import debug, { debugMode } from './debug.js';

const { version } = chrome.runtime.getManifest();
const hostRegexp = new RegExp(new URL(chrome.runtime.getURL('/')).host, 'g');

const config = {
  tunnel: 'https://crashreporting.ghostery.net/',
  dsn: 'https://05c74f55666649f0b6d671b9c37f6da1@o475874.ingest.sentry.io/6447378',
  release: `ghostery-extension@${version}`,
  debug: debugMode,
  environment: debugMode ? 'development' : 'production',
  // We use Sentry to track critical errors only.
  // That means we want to prevent default configuration from
  // sending additional messages like session logs, activity pings, etc
  autoSessionTracking: false,
  defaultIntegrations: false,
  sampleRate: debugMode ? 1.0 : 0.3,
  attachStacktrace: true,
};

Sentry.init(config);

getBrowserInfo().then(
  ({ token }) => {
    Sentry.setTag('ua', token);
  },
  // empty error handled for tests
  () => {},
);

let terms = false;
observe('terms', (value) => {
  terms = value;
});

export function captureException(error) {
  if (!terms || !(error instanceof Error)) return;

  const newError = new Error(error.message);
  newError.name = error.name;
  newError.cause = error.cause;
  newError.stack = error.stack.replace(hostRegexp, 'filtered');
  if (__PLATFORM__ !== 'tests') {
    Sentry.captureException(newError);
  }
}

debug.errors = { captureException };
