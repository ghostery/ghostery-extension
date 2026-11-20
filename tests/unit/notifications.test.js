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

import { afterEach, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';

const originalChrome = globalThis.chrome;
const moduleMocks = [];
let importCounter = 0;

afterEach(() => {
  for (const moduleMock of moduleMocks.splice(0)) moduleMock.restore();
  mock.restoreAll();
  globalThis.chrome = originalChrome;
});

async function setup() {
  const saved = new Map();

  const Options = {};
  const Notification = {};

  moduleMocks.push(
    mock.module('hybrids', {
      exports: {
        store: {
          // The storage is asynchronous, so parallel calls can read old values
          resolve: async (Model, id) => {
            await setImmediate();

            if (Model === Options) return { terms: true };
            if (Model !== Notification) return {};
            if (!saved.has(id)) throw new Error('Not found');

            return saved.get(id);
          },
          set: async (Model, values) => {
            await setImmediate();
            saved.set(values.id, values);

            return values;
          },
        },
      },
    }),
    mock.module('/store/config.js', { exports: { default: {} } }),
    mock.module('/store/managed-config.js', { exports: { default: {} } }),
    mock.module('/store/notification.js', { exports: { default: Notification } }),
    mock.module('/store/options.js', { exports: { default: Options } }),
    mock.module('/utils/storage.js', { exports: { checkStorage: async () => true } }),
  );

  mock.method(console, 'log', () => {});
  mock.method(console, 'error', () => {});

  globalThis.__DEBUG__ = false;
  globalThis.__STAGING__ = false;
  globalThis.chrome = {
    runtime: {
      getURL: (path) => `chrome-extension://id${path}`,
      onMessage: { addListener() {} },
    },
    webNavigation: { onCompleted: { addListener() {} } },
    tabs: { sendMessage: mock.fn(async () => true) },
  };

  return import(`../../src/background/notifications.js?test=${importCounter++}`);
}

describe('notifications', () => {
  it('keeps the shown limit for parallel calls', async () => {
    const { openNotification } = await setup();

    const results = await Promise.all(
      [1, 2, 3].map((tabId) => openNotification({ id: 'review', tabId, shownLimit: 1 })),
    );

    assert.deepEqual(results, [true, false, false]);
    assert.equal(chrome.tabs.sendMessage.mock.callCount(), 1);
  });

  it('opens the next notification after a failed call', async () => {
    const { openNotification } = await setup();

    chrome.tabs.sendMessage.mock.mockImplementationOnce(async () => {
      throw new Error('Receiving end does not exist');
    });

    const results = await Promise.all(
      [1, 2].map((tabId) => openNotification({ id: 'review', tabId, shownLimit: 1 })),
    );

    assert.deepEqual(results, [false, true]);
  });
});
