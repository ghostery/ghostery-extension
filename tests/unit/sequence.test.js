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

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import sequence from '../../src/utils/sequence.js';

describe('sequence', () => {
  it('runs the calls one by one', async () => {
    const log = [];
    const fn = sequence(async (value) => {
      log.push(`start ${value}`);
      await Promise.resolve();
      log.push(`end ${value}`);
    });

    await Promise.all([fn(1), fn(2)]);

    assert.deepEqual(log, ['start 1', 'end 1', 'start 2', 'end 2']);
  });

  it('continues after a rejected call', async () => {
    const fn = sequence(async (value) => {
      if (value === 1) throw new Error('Failed');

      return value;
    });

    await assert.rejects(fn(1), /Failed/);
    assert.equal(await fn(2), 2);
  });

  // why it needs "return async function" and not just "return function"
  it('returns a new promise', async () => {
    const log = [];
    const fn = sequence(async (value) => {
      log.push(`call ${value}`);
    });

    await Promise.all([fn(1).then(() => log.push('resolved 1')), fn(2)]);

    // Without "async", fn(1) would return the queue's promise. Its catch would hide
    // errors that the caller ignores, and "resolved 1" would come before "call 2".
    assert.deepEqual(log, ['call 1', 'call 2', 'resolved 1']);
  });
});
