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

function captureConsoleError(fn) {
  const calls = [];
  const original = console.error;
  console.error = (...args) => calls.push(args);
  try {
    fn();
  } finally {
    console.error = original;
  }
  return calls;
}

// A DOM stand-in whose `evaluate` lives on the prototype and throws for our
// probe arguments, exactly like the real `document.evaluate`.
function installFakeDocument() {
  let nativeCalls = 0;
  const proto = {};
  Object.defineProperty(proto, 'evaluate', {
    value: function evaluate(expression, contextNode) {
      nativeCalls += 1;
      if (arguments.length < 2 || (contextNode !== null && typeof contextNode !== 'object')) {
        throw new TypeError("Failed to execute 'evaluate': parameter 2 is not of type 'Node'.");
      }
      return { nativeXPathResult: true };
    },
    writable: true,
    enumerable: false,
    configurable: true,
  });

  const document = Object.create(proto);
  globalThis.document = document;
  return { document, proto, nativeCalls: () => nativeCalls };
}

const COUNTER = 'function (g, ...a) { self.__c = (self.__c || 0) + 1; }';
const THROWER = 'function () { self.__t = (self.__t || 0) + 1; throw new Error("boom"); }';

const SECRET = 'secret-8f3a';

describe('scriptlet idempotency guard', () => {
  let previousSelf;
  let previousDocument;
  let counter;
  let thrower;

  beforeEach(() => {
    previousSelf = globalThis.self;
    previousDocument = globalThis.document;
    globalThis.self = {};
    installFakeDocument();
    counter = build(COUNTER);
    thrower = build(THROWER);
  });

  afterEach(() => {
    globalThis.self = previousSelf;
    globalThis.document = previousDocument;
  });

  it('runs the original once for the same token, then dedups', () => {
    assert.equal(counter(SECRET, 'token-1'), true);
    assert.equal(counter(SECRET, 'token-1'), false);
    assert.equal(globalThis.self.__c, 1);
  });

  it('runs again for a different token', () => {
    assert.equal(counter(SECRET, 'a'), true);
    assert.equal(counter(SECRET, 'b'), true);
    assert.equal(globalThis.self.__c, 2);
  });

  it('dedups across independently injected copies of the scriptlet', () => {
    const first = build(COUNTER);
    const second = build(COUNTER);

    assert.equal(first(SECRET, 'shared'), true);
    assert.equal(second(SECRET, 'shared'), false);
    assert.equal(globalThis.self.__c, 1);
  });

  it('does not claim the token when the scriptlet throws, so it is retried', () => {
    assert.equal(thrower(SECRET, 'boom'), undefined);
    assert.equal(thrower(SECRET, 'boom'), undefined);
    assert.equal(globalThis.self.__t, 2);
  });

  it('logs the swallowed error only in debug builds', () => {
    const debugThrower = build(THROWER, { debug: true, name: 'broken.js' });

    const debugCalls = captureConsoleError(() =>
      assert.equal(debugThrower(SECRET, 'x'), undefined),
    );
    const releaseCalls = captureConsoleError(() => assert.equal(thrower(SECRET, 'y'), undefined));

    assert.equal(debugCalls.length, 1);
    assert.match(debugCalls[0][0], /broken\.js/);
    assert.match(String(debugCalls[0][1]), /boom/);
    assert.equal(releaseCalls.length, 0);
  });

  it('runs unguarded (no dedup) when the guard arguments are missing', () => {
    assert.equal(counter(), true);
    assert.equal(counter(), true);
    assert.equal(globalThis.self.__c, 2);
  });

  it('passes `this`, scriptletGlobals and args through to the original', () => {
    const fn = build('function (g, ...a) { self.seen = { x: this.x, g: g, args: a }; }');

    fn.call({ x: 42 }, SECRET, 't', { marker: 1 }, 'a', 'b');

    assert.equal(globalThis.self.seen.x, 42);
    assert.deepEqual(globalThis.self.seen.g, { marker: 1 });
    assert.deepEqual(globalThis.self.seen.args, ['a', 'b']);
  });

  it('leaves no enumerable or own-property footprint on the page', () => {
    const { document, proto } = installFakeDocument();
    counter = build(COUNTER);

    const windowKeysBefore = Object.getOwnPropertyNames(globalThis).sort();
    counter(SECRET, 't');

    assert.deepEqual(Object.getOwnPropertyNames(document), []);
    assert.deepEqual(Object.getOwnPropertyNames(proto), ['evaluate']);
    assert.equal(Object.getOwnPropertyDescriptor(proto, 'evaluate').enumerable, false);
    assert.deepEqual(Object.getOwnPropertyNames(globalThis).sort(), windowKeysBefore);
  });

  it('delegates real XPath calls to the native evaluate', () => {
    counter(SECRET, 't');

    const result = globalThis.document.evaluate('//div', globalThis.document);
    assert.deepEqual(result, { nativeXPathResult: true });
  });

  it('cannot be suppressed by a page that forges the guard handshake', () => {
    Object.getPrototypeOf(globalThis.document).evaluate = function () {
      return { s: 'not-the-secret', has: true };
    };

    counter = build(COUNTER);

    assert.equal(counter(SECRET, 't'), true);
    assert.equal(globalThis.self.__c, 1);
  });

  it('fails open when Proxy is unavailable', () => {
    const OriginalProxy = globalThis.Proxy;
    globalThis.Proxy = undefined;

    try {
      assert.equal(counter(SECRET, 't'), true);
      assert.equal(counter(SECRET, 't'), true);
    } finally {
      globalThis.Proxy = OriginalProxy;
    }

    assert.equal(globalThis.self.__c, 2);
  });

  it('fails open when document.evaluate is missing', () => {
    globalThis.document = {};
    counter = build(COUNTER);

    assert.equal(counter(SECRET, 't'), true);
    assert.equal(counter(SECRET, 't'), true);
    assert.equal(globalThis.self.__c, 2);
  });
});
