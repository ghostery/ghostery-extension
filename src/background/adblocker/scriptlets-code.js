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

// Each scriptlet from @ghostery/scriptlets has its own copy of uBO's helper `safeSelf()`, which caches the "native" functions it sees when it first runs.
// So a scriptlet captures the natives already wrapped by the scriptlets before it.
// All scriptlets of one injection run in one private scope with one `scriptletGlobals` object, and the `safeSelf()` cache is stored on it.
const SAFE_SELF_CACHE = /\bsafeSelf\.safe\b/g;
const SHARED_SAFE_SELF_CACHE = 'scriptletGlobals.safeSelf';

const sources = new WeakMap();

// Scriptlet source with the safeSelf cache routed to scriptletGlobals, cached per function
export function getScriptletSource(func) {
  let source = sources.get(func);

  if (source === undefined) {
    source = func.toString().replace(SAFE_SELF_CACHE, SHARED_SAFE_SELF_CACHE);
    sources.set(func, source);
  }

  return source;
}

// Code for one world of one hostname: a private scope with the shared globals, then one call per `{ func, args }` entry
export function buildScriptletsCode(scriptletGlobals, entries) {
  if (entries.length === 0) return '';

  return [
    '(function () {',
    `const scriptletGlobals = ${JSON.stringify(scriptletGlobals)};`,
    ...entries.map(
      ({ func, args }) =>
        `(${getScriptletSource(func)})(scriptletGlobals, ...${JSON.stringify(args)});`,
    ),
    '})();',
    '',
  ].join('\n');
}
