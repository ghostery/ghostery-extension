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

export default function debounce(fn, { waitFor, maxWait }) {
  let delayedTimer;
  let maxWaitTimer;

  const clear = () => {
    clearTimeout(delayedTimer);
    clearTimeout(maxWaitTimer);
    delayedTimer = undefined;
    maxWaitTimer = undefined;
  };

  let args = [];
  const run = () => {
    clear();
    fn(...args);

    args = [];
  };

  return (...latestArgs) => {
    args = latestArgs;

    if (maxWait > 0 && maxWaitTimer === undefined) {
      maxWaitTimer = setTimeout(run, maxWait);
    }
    clearTimeout(delayedTimer);
    delayedTimer = setTimeout(run, waitFor);
  };
}
