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

// The executed-token set hides in a closure behind a Proxy over `document.evaluate`:
// patching the existing slot in place adds no page-enumerable property.
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

  // Native `evaluate` throws on these arguments; only the guard proxy answers, echoing the secret.
  function ask(key, claim) {
    try {
      var answer = document.evaluate(secret, key, claim);
      return answer && typeof answer === 'object' && answer.s === secret ? answer : null;
    } catch {
      return null;
    }
  }

  var status = ask(token, false);

  if (!status) {
    try {
      var evaluate = document.evaluate;
      if (typeof evaluate !== 'function') return run();

      var owner = document;
      while (owner && !Object.prototype.hasOwnProperty.call(owner, 'evaluate')) {
        owner = Object.getPrototypeOf(owner);
      }
      if (!owner) return run();

      var store = new Set();
      Object.defineProperty(owner, 'evaluate', {
        value: new Proxy(evaluate, {
          apply: function (target, that, callArgs) {
            if (callArgs[0] !== secret) return target.apply(that, callArgs);
            if (callArgs[2]) {
              store.add(callArgs[1]);
              return { s: secret };
            }
            return { s: secret, has: store.has(callArgs[1]) };
          },
        }),
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

  if (status.has) return false;

  // Claiming only after a successful run means a throwing scriptlet is retried, never suppressed.
  var result = run();
  if (result === true) ask(token, true);
  return result;
}

export function wrapScriptletSource(originalSource, { debug = false, name = 'scriptlet' } = {}) {
  const logError = debug
    ? `function (e) { console.error(${JSON.stringify(`[adblocker] ${name} failed:`)}, e); }`
    : 'null';

  return `function (__secret, __token, ...__args) {
  return (${guardRunOnce.toString()})(__secret, __token, (${originalSource}), __args, this, ${logError});
}`;
}
