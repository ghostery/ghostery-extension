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

const MENUS_COUNT = 15;
const originalChrome = globalThis.chrome;
const moduleMocks = [];
let importCounter = 0;

afterEach(() => {
  for (const moduleMock of moduleMocks.splice(0)) moduleMock.restore();
  mock.restoreAll();
  globalThis.chrome = originalChrome;
});

async function setup({ existing = false } = {}) {
  const menus = new Map();
  const listeners = {};
  const errors = [];

  moduleMocks.push(
    mock.module('hybrids', {
      exports: {
        store: { resolve: async () => ({ contextMenu: true, terms: true }) },
        msg: (strings) => strings.join(''),
      },
    }),
    mock.module('/store/options.js', { exports: { default: {}, MODE_ZAP: 'zap' } }),
    mock.module('/utils/tabs.js', { exports: { openTabWithUrl() {} } }),
    mock.module('../../src/background/stats.js', { exports: { tabStats: new Map() } }),
    mock.module('../../src/background/element-picker.js', {
      exports: { openElementPicker() {} },
    }),
  );

  mock.method(console, 'info', () => {});
  mock.method(console, 'error', (error) => {
    if (error instanceof Error) errors.push(error);
  });

  globalThis.chrome = {
    runtime: {
      getURL: (path) => path,
      onInstalled: { addListener: (fn) => (listeners.installed = fn) },
    },
    contextMenus: {
      removeAll: mock.fn(async () => menus.clear()),
      create: mock.fn((properties, callback) => {
        if (properties.parentId) assert.ok(menus.has(properties.parentId));
        menus.set(properties.id, { ...properties });
        queueMicrotask(callback);
      }),
      update: mock.fn(async (id, properties) => {
        if (!menus.has(id)) {
          throw new Error('Invalid call to menus.update(). Menu item not found.');
        }
        Object.assign(menus.get(id), properties);
      }),
      onClicked: { addListener() {} },
    },
    tabs: {
      onActivated: { addListener: (fn) => (listeners.activated = fn) },
      onUpdated: { addListener: (fn) => (listeners.updated = fn) },
    },
  };

  await import(`../../src/background/context-menu.js?test=${importCounter++}`);

  if (existing) {
    listeners.installed();
    await setImmediate();
    chrome.contextMenus.removeAll.mock.resetCalls();
    chrome.contextMenus.create.mock.resetCalls();
  }

  return { menus, listeners, errors };
}

describe('context menu', () => {
  it('creates menus on install', async () => {
    const { menus, listeners, errors } = await setup();

    assert.equal(menus.size, 0);
    listeners.installed();
    await setImmediate();

    assert.equal(menus.size, MENUS_COUNT);
    assert.deepEqual(errors, []);
  });

  it('does not recreate menus that already exist', async () => {
    const { menus, listeners, errors } = await setup({ existing: true });

    listeners.activated({ tabId: 1 });
    await setImmediate();

    assert.equal(chrome.contextMenus.create.mock.callCount(), 0);
    assert.equal(menus.get('ghostery').visible, true);
    assert.deepEqual(errors, []);
  });

  it('recreates missing menus and applies visibility', async () => {
    const { menus, listeners, errors } = await setup();

    listeners.activated({ tabId: 1 });
    await setImmediate();

    assert.equal(menus.size, MENUS_COUNT);
    assert.equal(menus.get('ghostery').visible, true);
    assert.equal(menus.get('ghostery').enabled, true);
    assert.deepEqual(errors, []);
  });

  it('recreates missing menus once for concurrent updates', async () => {
    const { menus, listeners, errors } = await setup();

    listeners.activated({ tabId: 1 });
    listeners.updated(1, { status: 'complete' });
    await setImmediate();

    assert.equal(chrome.contextMenus.removeAll.mock.callCount(), 1);
    assert.equal(chrome.contextMenus.create.mock.callCount(), MENUS_COUNT);
    assert.equal(menus.get('ghostery').visible, true);
    assert.deepEqual(errors, []);
  });
});
