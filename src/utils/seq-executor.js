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
 * Allows to run async operations one by one (FIFO, first-in first-out).
 * The execution of function will only be started once all previously
 * scheduled functions have resolved (either successfully or by an exception).
 */
export default class SeqExecutor {
  constructor() {
    this.pending = Promise.resolve();
  }

  async run(func) {
    let result;
    let failed = false;
    this.pending = this.pending.then(async () => {
      try {
        result = await func();
      } catch (e) {
        failed = true;
        result = e;
      }
    });
    await this.pending;
    if (failed) {
      throw result;
    }
    return result;
  }

  async waitForAll() {
    await this.pending;
  }
}
