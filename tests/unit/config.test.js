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

import { describe, it, before } from 'node:test';
import assert from 'node:assert';

import { filter } from '../../src/utils/config.js';

describe('Remote config', () => {
  before(() => {
    global.chrome = { runtime: {} };
  });

  describe('filter()', () => {
    it('should return false for unsupported filters', () => {
      const originalWarn = console.warn;
      let warnCalled = false;
      console.warn = (msg) => {
        if (msg.includes('Unsupported filter key')) {
          warnCalled = true;
        }
      };

      try {
        assert.strictEqual(filter({ filter: { unsupported: 'check' } }), false);
        assert.strictEqual(warnCalled, true);
      } finally {
        console.warn = originalWarn;
      }
    });

    it('should return true if no filter is provided', () => {
      assert.strictEqual(filter({}), true);
    });

    it('should return true if version matches exactly', () => {
      global.chrome.runtime.getManifest = () => ({ version: '2.0.0' });
      assert.strictEqual(filter({ filter: { version: '2.0.0' } }), true);
    });

    it('should return true if current version is higher', () => {
      global.chrome.runtime.getManifest = () => ({ version: '2.1.0' });
      assert.strictEqual(filter({ filter: { version: '2.0.0' } }), true);
    });

    it('should return false if current version is lower', () => {
      global.chrome.runtime.getManifest = () => ({ version: '1.9.9' });
      assert.strictEqual(filter({ filter: { version: '2.0.0' } }), false);
    });

    it('should handle multi-part versions correctly', () => {
      global.chrome.runtime.getManifest = () => ({ version: '2.0.0' });
      assert.strictEqual(filter({ filter: { version: '1.5.0' } }), true); // 2 > 1
      assert.strictEqual(filter({ filter: { version: '2.0.1' } }), false); // 0 < 1
    });

    it('should return true if platform matches', () => {
      global.__PLATFORM__ = 'chromium';
      assert.strictEqual(filter({ filter: { platform: ['chromium'] } }), true);
    });

    it('should return false if platform does not match', () => {
      global.__PLATFORM__ = 'chromium';
      assert.strictEqual(filter({ filter: { platform: ['firefox'] } }), false);
    });

    it('should return true for firefox platform when set', () => {
      global.__PLATFORM__ = 'firefox';
      assert.strictEqual(filter({ filter: { platform: ['firefox'] } }), true);
      assert.strictEqual(filter({ filter: { platform: ['chromium'] } }), false);
    });

    it('should combine version and platform checks', () => {
      global.__PLATFORM__ = 'chromium';
      global.chrome.runtime.getManifest = () => ({ version: '2.0.0' });

      // Both match
      assert.strictEqual(
        filter({ filter: { version: '1.0.0', platform: ['chromium'] } }),
        true,
      );

      // Version mismatch
      assert.strictEqual(
        filter({ filter: { version: '3.0.0', platform: ['chromium'] } }),
        false,
      );

      // Platform mismatch
      assert.strictEqual(
        filter({ filter: { version: '1.0.0', platform: ['firefox'] } }),
        false,
      );
    });
  });
});
