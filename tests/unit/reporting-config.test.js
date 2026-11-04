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

import { afterEach, describe, mock, test } from 'node:test';
import assert from 'node:assert/strict';

const originalNavigator = globalThis.navigator;
const originalStaging = globalThis.__STAGING__;
const moduleMocks = [];
let importCounter = 0;

afterEach(() => {
  for (const moduleMock of moduleMocks.splice(0)) moduleMock.restore();
  Object.defineProperty(globalThis, 'navigator', {
    value: originalNavigator,
    configurable: true,
    writable: true,
  });
  globalThis.__STAGING__ = originalStaging;
});

async function getChannel({ os, userAgent, vendor = '' }) {
  moduleMocks.push(mock.module('/utils/browser-info.js', { exports: { getOS: () => os } }));
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent, vendor },
    configurable: true,
    writable: true,
  });
  globalThis.__STAGING__ = false;

  const { default: config } = await import(
    `../../src/background/reporting/config.js?case=${importCounter++}`
  );

  return config.url.CHANNEL;
}

const SAFARI_MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Safari/605.1.15';

describe('Reporting channel on Apple devices', () => {
  test('Safari on iPhone uses iOS patterns', async () => {
    const channel = await getChannel({
      os: 'ios',
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1',
      vendor: 'Apple Computer, Inc.',
    });
    assert.equal(channel, 'safari-ios');
  });

  // Safari on a touchscreen Mac is detected as iPadOS too
  test('Safari on iPad uses desktop patterns', async () => {
    const channel = await getChannel({
      os: 'ipados',
      userAgent: SAFARI_MAC_UA,
      vendor: 'Apple Computer, Inc.',
    });
    assert.equal(channel, 'safari-desktop');
  });

  test('Edge on iPad uses desktop patterns', async () => {
    const channel = await getChannel({
      os: 'ipados',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/152.0.4191.49',
      vendor: 'Apple Computer, Inc.',
    });
    assert.equal(channel, 'safari-desktop');
  });

  test('Safari on Mac uses desktop patterns', async () => {
    const channel = await getChannel({
      os: 'mac',
      userAgent: SAFARI_MAC_UA,
      vendor: 'Apple Computer, Inc.',
    });
    assert.equal(channel, 'safari-desktop');
  });
});
