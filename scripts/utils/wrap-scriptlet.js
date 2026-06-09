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

// Wraps a scriptlet's source with an in-document idempotency guard. The wrapped
// function keeps a Set of executed tokens on `self[__guardBase]` and runs the
// original at most once per (scriptlet, args) per document. The claim happens
// only after the original completes, so a "too-early" injection that throws is
// retried by a later trigger instead of being silently suppressed.
//
// Correctness relies on:
// * the renderer being single-threaded (two executeScript calls into the same
//   world run as serialized run-to-completion tasks),
// * a random `__guardBase` (a hostile page cannot pre-seed the registry), and
// * the registry living in the document global (it vanishes with the document).
export function wrapScriptletSource(originalSource) {
  return `function (scriptletGlobals = {}, ...args) {
  var __orig = (${originalSource});
  var __g = scriptletGlobals || {};
  var __base = __g.__guardBase, __token = __g.__guardToken;
  if (!__base || !__token) {
    __orig.apply(this, arguments);
    return true;
  }
  var __w = self, __reg = __w[__base];
  if (__reg === undefined) {
    __reg = new Set();
    try {
      Object.defineProperty(__w, __base, {
        value: __reg, enumerable: false, configurable: false, writable: false,
      });
    } catch (e) {
      // base already locked by an earlier injection; fall through and re-read
    }
    __reg = __w[__base];
  }
  if (__reg instanceof Set && __reg.has(__token)) return false;
  try {
    __orig.apply(this, arguments);
  } catch (e) {
    return undefined;
  }
  if (__reg instanceof Set) __reg.add(__token);
  return true;
}`;
}
