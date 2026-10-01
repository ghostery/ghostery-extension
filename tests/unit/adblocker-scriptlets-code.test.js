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
import vm from 'node:vm';
import scriptlets from '@ghostery/scriptlets';

import {
  buildScriptletsCode,
  getScriptletSource,
} from '../../src/background/adblocker/scriptlets-code.js';

const scriptletGlobals = { warOrigin: 'moz-extension://test/rule_resources/redirects/' };

// This scriptlet clones the argument of the hooked method with safe.JSON_stringify and safe.JSON_parse on each call
const HOOKS = 6;
const editInboundObject = scriptlets['trusted-edit-inbound-object.js'].func;
const hooks = Array.from({ length: HOOKS }, (_, i) => ({
  func: editInboundObject,
  args: ['JSON.stringify', '0', `[?.hook${i}]+={"edited":true}`],
}));

// A fresh realm is the page; counting wrappers replace the native JSON methods before the scriptlets capture them
function createPage() {
  // Web APIs that safeSelf() captures and that a bare realm does not have
  const page = vm.createContext({
    console,
    EventTarget: class EventTarget {},
    Request: class Request {},
    XMLHttpRequest: class XMLHttpRequest {},
    BroadcastChannel: class BroadcastChannel {},
    fetch() {},
  });

  vm.runInContext(
    `
      globalThis.self = globalThis;
      globalThis.window = globalThis;

      const stringify = JSON.stringify;
      const parse = JSON.parse;
      globalThis.calls = { stringify: 0, parse: 0 };
      JSON.stringify = function (...args) { calls.stringify += 1; return stringify.apply(JSON, args); };
      JSON.parse = function (...args) { calls.parse += 1; return parse.apply(JSON, args); };
    `,
    page,
  );

  return page;
}

function countNativeCalls(page) {
  vm.runInContext(
    'calls.stringify = 0; calls.parse = 0; JSON.stringify({ a: [1, 2, 3], b: { c: "d" } });',
    page,
  );

  return page.calls;
}

describe('buildScriptletsCode', () => {
  it('returns no code without scriptlets', () => {
    assert.equal(buildScriptletsCode(scriptletGlobals, []), '');
  });

  it('runs the scriptlets with one shared globals object kept out of the page scope', () => {
    const page = createPage();
    const probe = (key) => ({ func: (globals, name) => (globalThis[name] = globals), args: [key] });

    vm.runInContext(buildScriptletsCode(scriptletGlobals, [probe('first'), probe('second')]), page);

    assert.equal(JSON.stringify(page.first), JSON.stringify(scriptletGlobals));
    assert.equal(page.first, page.second);
    assert.equal(vm.runInContext('typeof scriptletGlobals', page), 'undefined');
  });

  it('shares the safeSelf cache between scriptlets, so nested hooks stay linear', () => {
    const page = createPage();

    vm.runInContext(buildScriptletsCode(scriptletGlobals, hooks), page);
    const calls = countNativeCalls(page);

    // one call from the page plus one clone per hook
    assert.equal(calls.stringify, HOOKS + 1);
    assert.equal(calls.parse, HOOKS);
  });

  it('documents the fan-out of the unshared scriptlets', () => {
    // Control: with a private safeSelf() per scriptlet, each hook clones through all hooks before it
    const page = createPage();
    const code = hooks
      .map(({ func, args }) => `(${func})(...${JSON.stringify([scriptletGlobals, ...args])});`)
      .join('\n');

    vm.runInContext(code, page);
    const calls = countNativeCalls(page);

    assert.equal(calls.stringify, 2 ** HOOKS);
    assert.equal(calls.parse, 2 ** HOOKS - 1);
  });
});

describe('getScriptletSource', () => {
  it('routes the safeSelf cache through scriptletGlobals', () => {
    const source = getScriptletSource(editInboundObject);

    assert.ok(editInboundObject.toString().includes('safeSelf.safe'));
    assert.ok(!source.includes('safeSelf.safe'));
    assert.ok(source.includes('scriptletGlobals.safeSelf'));
  });

  it('caches the generated source per scriptlet', () => {
    assert.equal(getScriptletSource(editInboundObject), getScriptletSource(editInboundObject));
  });
});
