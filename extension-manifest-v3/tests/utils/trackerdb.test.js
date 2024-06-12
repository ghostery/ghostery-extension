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
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isTrusted } from '../../src/utils/trackerdb.js';

const createException = (blocked = false) => ({
  blocked,
  blockedDomains: ['foo.org'],
  trustedDomains: ['foo.org'],
});

describe('/utils/trackerdb.js', () => {
  describe('#isTrusted', () => {
    describe('not overwritten status', () => {
      describe('tab with not listed domain', () => {
        it('returns false for blocked categories', () => {
          const exception = createException(true);
          assert.strictEqual(
            isTrusted('bar.com', 'advertising', exception),
            false,
          );
        });

        it('returns false for trusted categories', () => {
          const exception = createException();
          assert.strictEqual(
            isTrusted('bar.com', 'essential', exception),
            false,
          );
        });
      });

      describe('tab with listed domain', () => {
        it('returns true for blocked categories', () => {
          const exception = createException(true);
          assert.strictEqual(
            isTrusted('foo.org', 'advertising', exception),
            true,
          );
        });

        it('returns false for trusted categories', () => {
          const exception = createException();
          assert.strictEqual(
            isTrusted('foo.org', 'essential', exception),
            false,
          );
        });
      });
    });

    describe('overwritten status', () => {
      describe('tab with not listed domain', () => {
        it('returns true for blocked categories', () => {
          const exception = createException();
          assert.strictEqual(
            isTrusted('bar.com', 'advertising', exception),
            true,
          );
        });

        it('returns false for trusted categories', () => {
          const exception = createException(true);
          assert.strictEqual(
            isTrusted('bar.com', 'essential', exception),
            false,
          );
        });
      });

      describe('tab with listed domain', () => {
        it('returns false for blocked categories', () => {
          const exception = createException();
          assert.strictEqual(
            isTrusted('foo.org', 'advertising', exception),
            false,
          );
        });

        it('returns true for trusted categories', () => {
          const exception = createException(true);
          assert.strictEqual(
            isTrusted('foo.org', 'essential', exception),
            true,
          );
        });
      });
    });
  });
});
