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

/**
 * Returns a wrapper of the async function, which runs the calls one by one
 * (FIFO, first-in first-out). A call will only be started once all previous
 * calls have finished (either successfully or by an exception).
 */
export default function sequence(fn) {
  let pending = Promise.resolve();

  return async function (...args) {
    const result = pending.then(() => fn.apply(this, args));
    pending = result.catch(() => {});
    return result;
  };
}
