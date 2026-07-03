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

// Runs the scriptlet at most once per document without leaving a detectable
// footprint. The executed-token set is kept in a closure behind a Proxy over
// `document.evaluate` (an obscure, rarely-called API) rather than in a property
// on the page global: patching the existing prototype slot in place adds no new
// key, so property scans of window/document/Document.prototype are unchanged.
//
// A page cannot forge the handshake — the guard only answers a caller that
// already knows the per-hostname secret and echoes it back — so a hostile page
// can at worst force a duplicate run, never suppress one. It also fails open on
// any error and claims a token only after the scriptlet returns, so a throwing
// injection is retried by the next trigger.
//
// In the MAIN world the page shares the realm and could, by wrapping
// `document.evaluate` first, observe the secret we pass and later suppress
// *subsequent* injections; the first injection (at document_start, before page
// script) always runs. This matches the guarantee for the isolated world, where
// the guard is invisible to the page entirely.
function guardRunOnce(secret, token, orig, args, thisArg, logError) {
  function run() {
    try {
      orig.apply(thisArg, args);
      return true;
    } catch (e) {
      if (logError) logError(e);
      return undefined;
    }
  }

  if (!secret || !token) return run();

  var evaluate;
  try {
    evaluate = document.evaluate;
  } catch {
    return run();
  }
  if (typeof evaluate !== 'function') return run();

  // Native `evaluate` throws on these arguments; only our guard returns an
  // object echoing the secret. `claim === true` records the token, otherwise it
  // reports whether the token already ran.
  function ask(key, claim) {
    try {
      var answer = document.evaluate(secret, key, claim === true);
      return answer && typeof answer === 'object' && answer.s === secret ? answer : null;
    } catch {
      return null;
    }
  }

  var status = ask(token, false);

  if (!status) {
    try {
      var owner = document;
      while (owner && !Object.prototype.hasOwnProperty.call(owner, 'evaluate')) {
        owner = Object.getPrototypeOf(owner);
      }
      if (!owner) return run();

      var store = new Set();
      var proxy = new Proxy(evaluate, {
        apply: function (target, that, callArgs) {
          if (callArgs[0] === secret) {
            var key = callArgs[1];
            if (callArgs[2] === true) {
              store.add(key);
              return { s: secret };
            }
            return { s: secret, has: store.has(key) };
          }
          return target.apply(that, callArgs);
        },
      });

      Object.defineProperty(owner, 'evaluate', {
        value: proxy,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    } catch {
      return run();
    }

    status = ask(token, false);
    if (!status) return run();
  }

  if (status.has === true) return false;

  var result = run();
  if (result === true) ask(token, true);
  return result;
}

export function wrapScriptletSource(originalSource, { debug = false, name = 'scriptlet' } = {}) {
  const logError = debug
    ? `function (e) { console.error(${JSON.stringify(`[adblocker] ${name} failed:`)}, e); }`
    : 'null';

  return `function (__secret, __token) {
  return (${guardRunOnce.toString()})(
    __secret,
    __token,
    (${originalSource}),
    Array.prototype.slice.call(arguments, 2),
    this,
    ${logError},
  );
}`;
}
