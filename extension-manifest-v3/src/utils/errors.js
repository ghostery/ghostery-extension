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

import { getBrowserInfo } from '@ghostery/libs';

import debug from './debug.js';

const manifest = chrome.runtime.getManifest();

const hostRegexp = new RegExp(new URL(chrome.runtime.getURL('/')).host, 'g');

const config = {
  tunnel: 'https://crashreporting.ghostery.net/',
  dsn: 'https://05c74f55666649f0b6d671b9c37f6da1@o475874.ingest.sentry.io/6447378',
  release: `ghostery-extension@${manifest.version}`,
  debug: manifest.debug,
  environment: manifest.debug ? 'development' : 'production',
  // We use Sentry to track critical errors only.
  // That means we want to prevent default configuration from
  // sending additional messages like session logs, activity pings, etc
  autoSessionTracking: false,
  defaultIntegrations: false,
  sampleRate: manifest.debug ? 1.0 : 0.3,
  attachStacktrace: true,
};

Sentry.init(config);

getBrowserInfo().then(({ token }) => {
  Sentry.setTag('ua', token);
});

export function captureException(error) {
  const newError = new Error(error.message);
  newError.name = error.name;
  newError.cause = error.cause;
  newError.stack = error.stack.replace(hostRegexp, 'filtered');
  Sentry.captureException(newError);
}

debug.errors = { captureException };
