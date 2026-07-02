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

// Wraps a scriptlet's source so it runs at most once per (scriptlet, args) per
// document, tracked as tokens in a locked Set on `self[__guardBase]`. Tokens are
// claimed only after the original returns, so a throwing injection is retried by
// the next trigger. In-world injections run as serialized run-to-completion
// tasks, so check-then-claim cannot interleave; on guard failure (hostile or
// frozen global) the original still runs, just unguarded.
// Scriptlet errors never escape the wrapper, so one broken scriptlet cannot stop
// the others bundled in the same content script; debug builds log them.
export function wrapScriptletSource(originalSource, { debug = false, name = 'scriptlet' } = {}) {
  const logError = debug
    ? `\n    console.error(${JSON.stringify(`[adblocker] ${name} failed:`)}, e);`
    : '';
  return `function (scriptletGlobals = {}, ...args) {
  var __orig = (${originalSource});
  var __base = scriptletGlobals?.__guardBase, __token = scriptletGlobals?.__guardToken, __reg;
  if (__base && __token) {
    try {
      var __cur = self[__base];
      if (__cur === undefined) {
        Object.defineProperty(self, __base, { value: new Set() });
        __cur = self[__base];
      }
      if (__cur instanceof Set) {
        if (__cur.has(__token)) return false;
        __reg = __cur;
      }
    } catch (e) {
      __reg = undefined;
    }
  }
  try {
    __orig.apply(this, arguments);
  } catch (e) {${logError}
    return undefined;
  }
  if (__reg) __reg.add(__token);
  return true;
}`;
}
