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

import { wrapScriptletSource } from '../../scripts/utils/scriptlets-module.js';

function build(originalSource, name) {
  return new Function(`return (${wrapScriptletSource(originalSource, name)});`)();
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

// Mimics the real document: `evaluate` lives on the prototype and throws on non-Node arguments.
function installFakeDocument() {
  const proto = {};
  Object.defineProperty(proto, 'evaluate', {
    value: function evaluate(expression, contextNode) {
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
  return { document, proto };
}

const COUNTER = 'function (g, ...a) { self.__c = (self.__c || 0) + 1; }';
const THROWER = 'function () { self.__t = (self.__t || 0) + 1; throw new Error("boom"); }';

const SECRET = 'secret-8f3a';

describe('scriptlet idempotency guard', () => {
  let counter;

  beforeEach(() => {
    globalThis.self = {};
    installFakeDocument();
    counter = build(COUNTER);
  });

  afterEach(() => {
    delete globalThis.self;
    delete globalThis.document;
  });

  it('runs once per token, deduping across independently injected copies', () => {
    const second = build(COUNTER);

    assert.equal(counter(SECRET, 'token-1'), true);
    assert.equal(counter(SECRET, 'token-1'), false);
    assert.equal(second(SECRET, 'token-1'), false);
    assert.equal(counter(SECRET, 'token-2'), true);
    assert.equal(globalThis.self.__c, 2);
  });

  it('does not claim the token when the scriptlet throws, and logs the error', () => {
    const thrower = build(THROWER, 'broken.js');

    const calls = captureConsoleError(() => {
      assert.equal(thrower(SECRET, 'boom'), undefined);
      assert.equal(thrower(SECRET, 'boom'), undefined);
    });

    assert.equal(globalThis.self.__t, 2);
    assert.equal(calls.length, 2);
    assert.match(calls[0].join(' '), /broken\.js.*boom/);
  });

  it('passes `this`, scriptletGlobals and args through to the original', () => {
    const fn = build('function (g, ...a) { self.seen = { x: this.x, g: g, args: a }; }');

    fn.call({ x: 42 }, SECRET, 't', { marker: 1 }, 'a', 'b');

    assert.equal(globalThis.self.seen.x, 42);
    assert.deepEqual(globalThis.self.seen.g, { marker: 1 });
    assert.deepEqual(globalThis.self.seen.args, ['a', 'b']);
  });

  it('leaves no page-visible footprint and delegates real XPath calls', () => {
    const { document, proto } = installFakeDocument();
    counter = build(COUNTER);

    const windowKeysBefore = Object.getOwnPropertyNames(globalThis).sort();
    counter(SECRET, 't');

    assert.deepEqual(Object.getOwnPropertyNames(document), []);
    assert.deepEqual(Object.getOwnPropertyNames(proto), ['evaluate']);
    assert.equal(Object.getOwnPropertyDescriptor(proto, 'evaluate').enumerable, false);
    assert.deepEqual(Object.getOwnPropertyNames(globalThis).sort(), windowKeysBefore);
    assert.deepEqual(document.evaluate('//div', document), { nativeXPathResult: true });
  });

  it('dedups per document when the patched prototype survives a navigation', () => {
    const proto = Object.getPrototypeOf(globalThis.document);

    assert.equal(counter(SECRET, 't'), true);
    assert.equal(counter(SECRET, 't'), false);

    globalThis.document = Object.create(proto);
    assert.equal(counter(SECRET, 't'), true);
    assert.equal(globalThis.self.__c, 2);
  });

  it('cannot be suppressed by a page that forges the guard handshake', () => {
    Object.getPrototypeOf(globalThis.document).evaluate = function () {
      return { s: 'not-the-secret', has: true };
    };

    counter = build(COUNTER);

    assert.equal(counter(SECRET, 't'), true);
    assert.equal(globalThis.self.__c, 1);
  });

  it('fails open (no dedup) without guard args or when Proxy/document.evaluate are unavailable', () => {
    assert.equal(counter(), true);
    assert.equal(counter(), true);

    const OriginalProxy = globalThis.Proxy;
    globalThis.Proxy = undefined;
    try {
      assert.equal(counter(SECRET, 't'), true);
      assert.equal(counter(SECRET, 't'), true);
    } finally {
      globalThis.Proxy = OriginalProxy;
    }

    globalThis.document = {};
    assert.equal(counter(SECRET, 't'), true);
    assert.equal(globalThis.self.__c, 5);
  });
});
