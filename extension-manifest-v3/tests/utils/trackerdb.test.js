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

import '../setup.js';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { isTrusted } from '../../src/utils/trackerdb.js';

describe('/utils/trackerdb.js', () => {
  describe('#isTrusted', () => {
    let exception;

    beforeEach(() => {
      exception = {
        overwriteStatus: false,
        blocked: ['foo.org'],
        allowed: ['foo.org'],
      };
    });

    describe('not overwritten status', () => {
      describe('tab with not listed domain', () => {
        it('returns false for blocked categories', () => {
          assert.strictEqual(
            isTrusted('bar.com', 'advertising', exception),
            false,
          );
        });

        it('returns true for trusted categories', () => {
          assert.strictEqual(isTrusted('bar.com', 'cdn', exception), true);
        });
      });

      describe('tab with listed domain', () => {
        it('returns true for blocked categories', () => {
          assert.strictEqual(
            isTrusted('foo.org', 'advertising', exception),
            true,
          );
        });

        it('returns false for trusted categories', () => {
          assert.strictEqual(isTrusted('foo.org', 'cdn', exception), false);
        });
      });
    });

    describe('overwritten status', () => {
      beforeEach(() => {
        exception.overwriteStatus = true;
      });

      describe('tab with not listed domain', () => {
        it('returns true for blocked categories', () => {
          assert.strictEqual(
            isTrusted('bar.com', 'advertising', exception),
            true,
          );
        });

        it('returns false for trusted categories', () => {
          assert.strictEqual(isTrusted('bar.com', 'cdn', exception), false);
        });
      });

      describe('tab with listed domain', () => {
        it('returns false for blocked categories', () => {
          assert.strictEqual(
            isTrusted('foo.org', 'advertising', exception),
            false,
          );
        });

        it('returns true for trusted categories', () => {
          assert.strictEqual(isTrusted('foo.org', 'cdn', exception), true);
        });
      });
    });
  });
});
