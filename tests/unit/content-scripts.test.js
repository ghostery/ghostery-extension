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

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { contentScripts } from '../../src/background/adblocker/content-scripts.js';

describe('adblocker content scripts registry', () => {
  let registrations;

  beforeEach(() => {
    registrations = [];
    globalThis.browser = {
      contentScripts: {
        register: async (options) => {
          const handle = {
            options,
            unregistered: false,
            unregister() {
              this.unregistered = true;
            },
          };
          registrations.push(handle);
          return handle;
        },
      },
    };
  });

  afterEach(() => {
    contentScripts.unregisterAll();
    delete globalThis.browser;
  });

  it('registers one content script per non-empty world with exact-host matches', async () => {
    await contentScripts.register('example.com', { MAIN: 'm;', ISOLATED: '' });

    assert.equal(registrations.length, 1);
    assert.deepEqual(registrations[0].options, {
      js: [{ code: 'm;' }],
      allFrames: true,
      matches: ['https://example.com/*', 'http://example.com/*'],
      matchAboutBlank: true,
      matchOriginAsFallback: true,
      runAt: 'document_start',
      world: 'MAIN',
    });

    await contentScripts.register('worlds.com', { MAIN: 'm;', ISOLATED: 'i;' });
    assert.deepEqual(
      registrations.slice(1).map((r) => r.options.world),
      ['MAIN', 'ISOLATED'],
    );
  });

  it('re-registers only when the code changes, including to empty code', async () => {
    await contentScripts.register('example.com', { MAIN: 'v1;', ISOLATED: '' });
    await contentScripts.register('example.com', { MAIN: 'v1;', ISOLATED: '' });
    assert.equal(registrations.length, 1);
    assert.equal(registrations[0].unregistered, false);

    await contentScripts.register('example.com', { MAIN: 'v2;', ISOLATED: '' });
    assert.equal(registrations[0].unregistered, true);
    assert.equal(registrations[1].options.js[0].code, 'v2;');

    await contentScripts.register('example.com', { MAIN: '', ISOLATED: '' });
    assert.equal(registrations[1].unregistered, true);
    assert.equal(registrations.length, 2);
  });

  it('discards a registration that resolves after being replaced', async () => {
    const pending = [];
    globalThis.browser.contentScripts.register = () =>
      new Promise((resolve) => pending.push(resolve));

    const first = contentScripts.register('example.com', { MAIN: 'v1;', ISOLATED: '' });
    const second = contentScripts.register('example.com', { MAIN: 'v2;', ISOLATED: '' });

    const handles = [0, 1].map(() => ({
      unregistered: false,
      unregister() {
        this.unregistered = true;
      },
    }));
    pending[0](handles[0]);
    pending[1](handles[1]);
    await Promise.all([first, second]);

    assert.equal(handles[0].unregistered, true);
    assert.equal(handles[1].unregistered, false);
  });

  it('retries after a failed registration', async () => {
    const warn = console.warn;
    console.warn = () => {};
    try {
      globalThis.browser.contentScripts.register = async () => {
        throw new Error('boom');
      };
      await contentScripts.register('example.com', { MAIN: 'm;', ISOLATED: '' });
    } finally {
      console.warn = warn;
    }

    globalThis.browser.contentScripts.register = async (options) => {
      const handle = { options, unregistered: false, unregister() {} };
      registrations.push(handle);
      return handle;
    };
    await contentScripts.register('example.com', { MAIN: 'm;', ISOLATED: '' });

    assert.equal(registrations.length, 1);
  });

  it('unregisterAll removes every registration and allows re-registration', async () => {
    await contentScripts.register('a.com', { MAIN: 'a;', ISOLATED: '' });
    await contentScripts.register('b.com', { MAIN: 'b;', ISOLATED: '' });

    contentScripts.unregisterAll();
    assert.deepEqual(
      registrations.map((r) => r.unregistered),
      [true, true],
    );

    await contentScripts.register('a.com', { MAIN: 'a;', ISOLATED: '' });
    assert.equal(registrations.length, 3);
  });
});
