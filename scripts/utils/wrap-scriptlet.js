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

// Fail open: a broken guard must never suppress the scriptlet. Tokens are claimed
// only after the original returns (throwing injections retry); in-world execution
// is run-to-completion, so check-then-claim cannot interleave.
export function wrapScriptletSource(originalSource, { debug = false, name = 'scriptlet' } = {}) {
  const logError = debug
    ? `\n    console.error(${JSON.stringify(`[adblocker] ${name} failed:`)}, e);`
    : '';
  return `function (__guardBase, __guardToken, ...__args) {
  var __orig = (${originalSource});
  var __reg;
  if (__guardBase && __guardToken) {
    try {
      var __cur = self[__guardBase];
      if (__cur === undefined) {
        Object.defineProperty(self, __guardBase, { value: new Set() });
        __cur = self[__guardBase];
      }
      if (__cur instanceof Set) {
        if (__cur.has(__guardToken)) return false;
        __reg = __cur;
      }
    } catch (e) {}
  }
  try {
    __orig.apply(this, __args);
  } catch (e) {${logError}
    return undefined;
  }
  if (__reg) __reg.add(__guardToken);
  return true;
}`;
}
