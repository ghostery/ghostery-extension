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

import { wrapScriptletSource } from '../../scripts/utils/wrap-scriptlet.js';

function build(originalSource, options) {
  return new Function(`return (${wrapScriptletSource(originalSource, options)});`)();
}

const COUNTER = 'function (g, ...a) { self.__c = (self.__c || 0) + 1; }';

describe('scriptlet idempotency guard', () => {
  let previousSelf;

  beforeEach(() => {
    previousSelf = globalThis.self;
    globalThis.self = {};
  });

  afterEach(() => {
    globalThis.self = previousSelf;
  });

  it('runs the original once for the same token, then dedups', () => {
    const fn = build(COUNTER);
    const globals = { __guardBase: '__base', __guardToken: 'token-1' };

    assert.equal(fn(globals), true);
    assert.equal(fn(globals), false);
    assert.equal(globalThis.self.__c, 1);
  });

  it('runs again for a different token', () => {
    const fn = build(COUNTER);

    assert.equal(fn({ __guardBase: '__base', __guardToken: 'a' }), true);
    assert.equal(fn({ __guardBase: '__base', __guardToken: 'b' }), true);
    assert.equal(globalThis.self.__c, 2);
  });

  it('does not claim the token when the scriptlet throws, so it is retried', () => {
    const fn = build('function () { throw new Error("boom"); }');
    const globals = { __guardBase: '__base', __guardToken: 'boom' };

    assert.equal(fn(globals), undefined);
    assert.equal(globalThis.self.__base.has('boom'), false);
    assert.equal(fn(globals), undefined);
  });

  it('keeps later scriptlets in a concatenated bundle running when an earlier one throws', () => {
    // Mirrors the Firefox content-script assembly in cosmetics.js:
    // `(${func})(...args);\n` statements executed in sequence.
    const thrower = wrapScriptletSource('function () { throw new Error("boom"); }');
    const counter = wrapScriptletSource(COUNTER);
    const bundle = `(${thrower})({});\n(${counter})({});\n`;

    new Function(bundle)();

    assert.equal(globalThis.self.__c, 1);
  });

  it('logs the swallowed error in debug builds', () => {
    const fn = build('function () { throw new Error("boom"); }', {
      debug: true,
      name: 'broken.js',
    });
    const calls = [];
    const original = console.error;
    console.error = (...args) => calls.push(args);

    try {
      assert.equal(fn({}), undefined);
    } finally {
      console.error = original;
    }

    assert.equal(calls.length, 1);
    assert.match(calls[0][0], /broken\.js/);
    assert.match(String(calls[0][1]), /boom/);
  });

  it('stays silent about the swallowed error outside debug builds', () => {
    const fn = build('function () { throw new Error("boom"); }');
    const calls = [];
    const original = console.error;
    console.error = (...args) => calls.push(args);

    try {
      assert.equal(fn({}), undefined);
    } finally {
      console.error = original;
    }

    assert.equal(calls.length, 0);
  });

  it('runs unguarded (no dedup) when guard fields are missing', () => {
    const fn = build(COUNTER);

    assert.equal(fn({}), true);
    assert.equal(fn({}), true);
    assert.equal(globalThis.self.__c, 2);
  });

  it('preserves `this` and `arguments` of the original', () => {
    const fn = build('function (g, ...a) { self.seen = { x: this.x, args: a }; }');

    fn.call({ x: 42 }, { __guardBase: '__base', __guardToken: 't' }, 'a', 'b');

    assert.equal(globalThis.self.seen.x, 42);
    assert.deepEqual(globalThis.self.seen.args, ['a', 'b']);
  });

  it('locks the registry so a hostile page cannot delete it to force re-injection', () => {
    const fn = build(COUNTER);
    const globals = { __guardBase: '__base', __guardToken: 't' };

    fn(globals);

    assert.throws(() => {
      delete globalThis.self.__base;
    }, TypeError);

    assert.equal(fn(globals), false);
    assert.equal(globalThis.self.__c, 1);
  });

  it('cannot be suppressed by a page that poisons the registry with a non-Set', () => {
    // A fake registry occupying the base must not short-circuit injection:
    // non-Sets are ignored, so dedup is lost but the scriptlet still runs.
    globalThis.self = { __base: { has: () => true, add() {} } };
    const fn = build(COUNTER);

    assert.equal(fn({ __guardBase: '__base', __guardToken: 't' }), true);
    assert.equal(globalThis.self.__c, 1);
  });

  it('fails open when the page nukes the global Set', () => {
    const fn = build(COUNTER);
    const globals = { __guardBase: '__base', __guardToken: 't' };
    const OriginalSet = globalThis.Set;
    globalThis.Set = undefined;

    try {
      assert.equal(fn(globals), true);
      assert.equal(fn(globals), true);
    } finally {
      globalThis.Set = OriginalSet;
    }

    assert.equal(globalThis.self.__c, 2);
  });

  it('is unaffected by a decoy registry under a guessed name (random base is load-bearing)', () => {
    globalThis.self = { ghostery_scriptlet_guard: { has: () => true } };
    const fn = build(COUNTER);
    const globals = { __guardBase: 'b6f1c0e2-not-guessable', __guardToken: 't' };

    // the decoy under the wrong name is ignored; the real base behaves normally
    assert.equal(fn(globals), true);
    assert.equal(globalThis.self.__c, 1);
    assert.equal(fn(globals), false);
    assert.equal(globalThis.self.__c, 1);
  });
});
