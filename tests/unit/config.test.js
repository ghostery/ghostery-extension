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

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { filter, compareVersions } from '../../src/utils/config.js';

describe('Remote config', () => {
  describe('compareVersions()', () => {
    it('should return 0 for equal versions', () => {
      assert.deepEqual(compareVersions('1.0.0', '1.0.0'), 0);
      assert.deepEqual(compareVersions('2.3.4', '2.3.4'), 0);
    });

    it('should return 1 when first version is greater', () => {
      assert.deepEqual(compareVersions('2.0.0', '1.0.0'), 1);
      assert.deepEqual(compareVersions('1.1.0', '1.0.0'), 1);
      assert.deepEqual(compareVersions('1.0.1', '1.0.0'), 1);
    });

    it('should return -1 when first version is lower', () => {
      assert.deepEqual(compareVersions('1.0.0', '2.0.0'), -1);
      assert.deepEqual(compareVersions('1.0.0', '1.1.0'), -1);
      assert.deepEqual(compareVersions('1.0.0', '1.0.1'), -1);
    });

    it('should handle versions with different part counts', () => {
      assert.deepEqual(compareVersions('1.0', '1.0.0'), 0);
      assert.deepEqual(compareVersions('1.0.0', '1.0'), 0);
      assert.deepEqual(compareVersions('1.0', '1.0.1'), -1);
      assert.deepEqual(compareVersions('1.0.1', '1.0'), 1);
    });
  });

  describe('filter()', () => {
    beforeEach(() => {
      global.__CHROMIUM__ = true;
      global.__FIREFOX__ = false;
    });

    it('should return false for unsupported filters', () => {
      const originalWarn = console.warn;
      let warnCalled = false;
      console.warn = (msg) => {
        if (msg.includes('Unsupported filter key')) {
          warnCalled = true;
        }
      };

      try {
        assert.deepEqual(filter({ filter: { unsupported: 'check' } }), false);
        assert.deepEqual(warnCalled, true);
      } finally {
        console.warn = originalWarn;
      }
    });

    it('should return true if no filter is provided', () => {
      assert.deepEqual(filter({}), true);
    });

    it('should return true if platform matches', () => {
      assert.deepEqual(filter({ filter: { platform: ['chromium'] } }), true);
    });

    it('should return false if platform does not match', () => {
      assert.deepEqual(filter({ filter: { platform: ['firefox'] } }), false);
    });

    it('should return true for firefox platform when set', () => {
      global.__CHROMIUM__ = false;
      global.__FIREFOX__ = true;

      assert.deepEqual(filter({ filter: { platform: ['firefox'] } }), true);
      assert.deepEqual(filter({ filter: { platform: ['chromium'] } }), false);
    });

    it('should return true if browser matches', () => {
      assert.deepEqual(filter({ filter: { browser: 'chrome' } }), true);
    });

    it('should return false if browser does not match', () => {
      assert.deepEqual(filter({ filter: { browser: 'firefox' } }), false);
    });

    it('should return true for firefox browser when set', () => {
      global.__CHROMIUM__ = false;
      global.__FIREFOX__ = true;

      assert.deepEqual(filter({ filter: { browser: 'firefox' } }), true);
      assert.deepEqual(filter({ filter: { browser: 'chrome' } }), false);
    });

    it('should return true if minVersion matches exactly', () => {
      global.chrome.runtime.getManifest = () => ({ version: '2.0.0' });
      assert.deepEqual(filter({ filter: { minVersion: '2.0.0' } }), true);
    });

    it('should return true if current version is above minVersion', () => {
      global.chrome.runtime.getManifest = () => ({ version: '2.1.0' });
      assert.deepEqual(filter({ filter: { minVersion: '2.0.0' } }), true);
    });

    it('should return false if current version is below minVersion', () => {
      global.chrome.runtime.getManifest = () => ({ version: '1.9.9' });
      assert.deepEqual(filter({ filter: { minVersion: '2.0.0' } }), false);
    });

    it('should return true if legacy version filter matches', () => {
      global.chrome.runtime.getManifest = () => ({ version: '2.0.0' });
      assert.deepEqual(filter({ filter: { version: '2.0.0' } }), true);
    });

    it('should return false if legacy version filter does not match', () => {
      global.chrome.runtime.getManifest = () => ({ version: '1.9.9' });
      assert.deepEqual(filter({ filter: { version: '2.0.0' } }), false);
    });
    it('should return true if maxVersion matches exactly', () => {
      global.chrome.runtime.getManifest = () => ({ version: '2.0.0' });
      assert.deepEqual(filter({ filter: { maxVersion: '2.0.0' } }), true);
    });

    it('should return true if current version is below maxVersion', () => {
      global.chrome.runtime.getManifest = () => ({ version: '1.9.0' });
      assert.deepEqual(filter({ filter: { maxVersion: '2.0.0' } }), true);
    });

    it('should return false if current version is above maxVersion', () => {
      global.chrome.runtime.getManifest = () => ({ version: '3.0.0' });
      assert.deepEqual(filter({ filter: { maxVersion: '2.0.0' } }), false);
    });

    it('should support minVersion and maxVersion together (version range)', () => {
      global.chrome.runtime.getManifest = () => ({ version: '2.5.0' });

      // Within range
      assert.deepEqual(filter({ filter: { minVersion: '2.0.0', maxVersion: '3.0.0' } }), true);

      // At lower bound
      global.chrome.runtime.getManifest = () => ({ version: '2.0.0' });
      assert.deepEqual(filter({ filter: { minVersion: '2.0.0', maxVersion: '3.0.0' } }), true);

      // At upper bound
      global.chrome.runtime.getManifest = () => ({ version: '3.0.0' });
      assert.deepEqual(filter({ filter: { minVersion: '2.0.0', maxVersion: '3.0.0' } }), true);

      // Below range
      global.chrome.runtime.getManifest = () => ({ version: '1.9.0' });
      assert.deepEqual(filter({ filter: { minVersion: '2.0.0', maxVersion: '3.0.0' } }), false);

      // Above range
      global.chrome.runtime.getManifest = () => ({ version: '3.1.0' });
      assert.deepEqual(filter({ filter: { minVersion: '2.0.0', maxVersion: '3.0.0' } }), false);
    });

    it('should combine minVersion/maxVersion with platform checks', () => {
      global.chrome.runtime.getManifest = () => ({ version: '2.5.0' });

      assert.deepEqual(
        filter({ filter: { minVersion: '2.0.0', maxVersion: '3.0.0', platform: ['chromium'] } }),
        true,
      );

      assert.deepEqual(
        filter({ filter: { minVersion: '2.0.0', maxVersion: '3.0.0', platform: ['firefox'] } }),
        false,
      );
    });
  });
});
