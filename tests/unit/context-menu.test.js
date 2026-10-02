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

async function setup({ existing = false, options = {} } = {}) {
  const menus = new Map();
  const listeners = {};
  const errors = [];
  const tabStats = new Map();
  // The active tab of the focused window
  const current = { tabId: 1 };

  const Options = {};
  const TabStats = {};

  moduleMocks.push(
    mock.module('hybrids', {
      exports: {
        store: {
          resolve: async (Model, id) => {
            if (Model === TabStats) return tabStats.get(id) ?? { hostname: '' };
            return { contextMenu: true, terms: true, ...options };
          },
        },
        msg: (strings) => strings.join(''),
      },
    }),
    mock.module('/store/options.js', { exports: { default: Options, MODE_ZAP: 'zap' } }),
    mock.module('/store/tab-stats.js', { exports: { default: TabStats } }),
    mock.module('/utils/tabs.js', { exports: { openTabWithUrl() {} } }),
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
      query: async () => [{ id: current.tabId }],
      onActivated: { addListener: (fn) => (listeners.activated = fn) },
      onUpdated: { addListener: (fn) => (listeners.updated = fn) },
    },
    windows: {
      WINDOW_ID_NONE: -1,
      onFocusChanged: { addListener: (fn) => (listeners.focusChanged = fn) },
    },
  };

  await import(`../../src/background/context-menu.js?test=${importCounter++}`);

  if (existing) {
    listeners.installed();
    await setImmediate();
    chrome.contextMenus.removeAll.mock.resetCalls();
    chrome.contextMenus.create.mock.resetCalls();
  }

  return { menus, listeners, errors, tabStats, current };
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
    listeners.updated(1, { status: 'complete' }, { id: 1, active: true });
    await setImmediate();

    assert.equal(chrome.contextMenus.removeAll.mock.callCount(), 1);
    assert.equal(chrome.contextMenus.create.mock.callCount(), MENUS_COUNT);
    assert.equal(menus.get('ghostery').visible, true);
    assert.deepEqual(errors, []);
  });

  describe('with a paused site in the active tab', () => {
    // Tab 1: paused site, tab 2: background tab, tab 3: active tab of a different window
    async function setupPaused() {
      const result = await setup({
        existing: true,
        options: { paused: { 'paused.com': { revokeAt: 0 } } },
      });

      result.tabStats.set(1, { hostname: 'paused.com' });
      result.tabStats.set(2, { hostname: 'other.com' });
      result.tabStats.set(3, { hostname: 'other.com' });

      result.listeners.activated({ tabId: 1 });
      await setImmediate();

      return result;
    }

    function assertPaused(menus, paused) {
      assert.equal(menus.get('ghostery:pause').visible, !paused);
      assert.equal(menus.get('ghostery:resume').visible, paused);
      assert.equal(menus.get('ghostery:element-picker').enabled, !paused);
    }

    it('shows the paused state', async () => {
      const { menus, errors } = await setupPaused();

      assertPaused(menus, true);
      assert.deepEqual(errors, []);
    });

    it('keeps the state when a background tab completes loading', async () => {
      const { menus, listeners, errors } = await setupPaused();

      listeners.updated(2, { status: 'complete' }, { id: 2, active: false });
      await setImmediate();

      assertPaused(menus, true);
      assert.deepEqual(errors, []);
    });

    it('keeps the state when the active tab of a different window completes loading', async () => {
      const { menus, listeners, errors } = await setupPaused();

      listeners.updated(3, { status: 'complete' }, { id: 3, active: true });
      await setImmediate();

      assertPaused(menus, true);
      assert.deepEqual(errors, []);
    });

    it('keeps the state when a tab of a different window is activated', async () => {
      const { menus, listeners, errors } = await setupPaused();

      listeners.activated({ tabId: 3 });
      await setImmediate();

      assertPaused(menus, true);
      assert.deepEqual(errors, []);
    });

    it('updates the state when the active tab completes loading', async () => {
      const { menus, listeners, tabStats, errors } = await setupPaused();

      tabStats.set(1, { hostname: 'other.com' });
      listeners.updated(1, { status: 'complete' }, { id: 1, active: true });
      await setImmediate();

      assertPaused(menus, false);
      assert.deepEqual(errors, []);
    });

    it('updates the state when a different window gets the focus', async () => {
      const { menus, listeners, current, errors } = await setupPaused();

      current.tabId = 3;
      listeners.focusChanged(2);
      await setImmediate();

      assertPaused(menus, false);
      assert.deepEqual(errors, []);
    });

    it('ignores the focus change when no window has the focus', async () => {
      const { menus, listeners, current, errors } = await setupPaused();

      current.tabId = 3;
      listeners.focusChanged(chrome.windows.WINDOW_ID_NONE);
      await setImmediate();

      assertPaused(menus, true);
      assert.deepEqual(errors, []);
    });
  });
});
