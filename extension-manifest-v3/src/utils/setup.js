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

export default function asyncSetup(promises, threshold = 5000) {
  let timeoutId;

  const result = {
    pending: Promise.race([
      Promise.all(promises),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(Error('Initial setup threshold exceeded'));
        }, threshold);
      }),
    ]).then((...args) => {
      result.pending = false;
      clearTimeout(timeoutId);

      return args;
    }),
  };

  result.pending.catch((e) => {
    console.warn('Error during async setup:', e);
  });

  return result;
}
