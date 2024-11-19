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

export default function asyncSetup(id, promises, threshold = 10000) {
  const timeoutId = setTimeout(() => {
    console.warn(
      `[setup] Initial setup of '${id}' exceeded threshold of ${threshold / 1000}s`,
    );
  }, threshold);

  const result = {
    pending: Promise.all(promises)
      .then((...args) => {
        clearTimeout(timeoutId);
        result.pending = false;

        return args;
      })
      .catch((e) => {
        clearTimeout(timeoutId);
        throw e;
      }),
  };

  return result;
}
