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
import { store } from 'hybrids';

import Errors from '/store/errors.js';
import Options from '/store/options.js';

import getBrowserInfo from './browser-info.js';

const SAMPLE_RATE = 0.3; // Sampling rate for non-critical errors in production
const TAG_CRITICAL = 'critical'; // Tag to identify critical errors that should always be sent

const { version } = chrome.runtime.getManifest();
const hostRegexp = new RegExp(new URL(chrome.runtime.getURL('/')).host, 'g');

const config = {
  tunnel: 'https://crashreporting.ghostery.net/',
  dsn: 'https://05c74f55666649f0b6d671b9c37f6da1@o475874.ingest.sentry.io/6447378',
  release: `ghostery-extension@${version}`,
  debug: __DEBUG__,
  environment: __DEBUG__ ? 'development' : 'production',
  // We use Sentry to track critical errors only.
  // That means we want to prevent default configuration from
  // sending additional messages like session logs, activity pings, etc
  autoSessionTracking: false,
  defaultIntegrations: false,
  // Sampling is handled in beforeSend to allow per-event control
  sampleRate: 1.0,
  beforeSend(event) {
    if (event.tags?.[TAG_CRITICAL]) {
      return event;
    }

    if (!__DEBUG__ && Math.random() > SAMPLE_RATE) {
      return null;
    }

    return event;
  },
  attachStacktrace: true,
};

Sentry.init(config);

getBrowserInfo().then(
  ({ token }) => Sentry.setTag('ua', token),
  // empty error handled for tests
  () => {},
);

export async function captureException(error, { critical = false, once = false } = {}) {
  const { terms, feedback } = await store.resolve(Options);

  if (!terms || !feedback || !(error instanceof Error)) {
    return;
  }

  if (once) {
    const id = error.message;

    if (typeof id !== 'string' || !id) {
      console.warn('[errors] error has no message to identify it');
      return;
    }

    const errors = await store.resolve(Errors);

    // Already sent this error, skip it
    if (errors.onceIds[id]) {
      return;
    }

    await store.set(errors, { onceIds: { [id]: true } });
  }

  const newError = new Error(error.message);

  newError.name = error.name;
  newError.cause = error.cause;
  newError.stack = error.stack.replace(hostRegexp, 'filtered');

  Sentry.withScope((scope) => {
    if (critical) scope.setTag(TAG_CRITICAL, true);
    Sentry.captureException(newError);
  });
}

if (__DEBUG__) {
  (globalThis.ghostery ??= {}).errors = { captureException };
}
