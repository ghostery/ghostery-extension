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
import { findParentDomain } from '../../src/store/options.js';

function forPausedHostnames(...hostnames) {
  return Object.fromEntries(
    hostnames.map((hostname) => [
      hostname,
      {
        revokeAt: Date.now() + 60 * 60 * 1000,
        assist: false,
        managed: false,
      },
    ]),
  );
}

describe('findParentDomain', () => {
  it('should find exact matches', () => {
    assert.equal(
      findParentDomain(forPausedHostnames('foo.test'), 'foo.test'),
      'foo.test',
    );
  });

  it('should return null when no matching domain is found', () => {
    assert.equal(
      findParentDomain(forPausedHostnames('foo.test'), 'bar.test'),
      null,
    );
  });

  it('should find parent domain for subdomain', () => {
    assert.equal(
      findParentDomain(forPausedHostnames('foo.test'), 'www.foo.test'),
      'foo.test',
    );
  });

  it('should not match against a smaller included string', () => {
    assert.equal(
      findParentDomain(forPausedHostnames('foobar.test'), 'bar.test'),
      null,
    );
  });

  it('should not match against a bigger included string', () => {
    assert.equal(
      findParentDomain(forPausedHostnames('bar.test'), 'foobar.test'),
      null,
    );
  });

  it('should return the shortest matching domain when multiple match', () => {
    assert.equal(
      findParentDomain(
        forPausedHostnames('foo.test', 'sub.foo.test'),
        'deeper.sub.foo.test',
      ),
      'foo.test',
    );
  });

  it('should handle empty record', () => {
    assert.equal(findParentDomain(forPausedHostnames(), 'foo.test'), null);
  });

  it('should work in a longer example', () => {
    const record = forPausedHostnames(
      'foo.test',
      'sub.foo.test',
      'bar.test',
      'a.test',
      'b.test',
    );
    assert.equal(findParentDomain(record, 'foo.test'), 'foo.test');
    assert.equal(findParentDomain(record, 'sub.foo.test'), 'foo.test');
    assert.equal(findParentDomain(record, 'other.foo.test'), 'foo.test');
    assert.equal(findParentDomain(record, 'deeper.sub.foo.test'), 'foo.test');
    assert.equal(findParentDomain(record, 'bar.test'), 'bar.test');
    assert.equal(findParentDomain(record, 'a.test'), 'a.test');
    assert.equal(findParentDomain(record, 'b.test'), 'b.test');
    assert.equal(findParentDomain(record, 'test'), null);
    assert.equal(findParentDomain(record, ''), null);
  });
});
