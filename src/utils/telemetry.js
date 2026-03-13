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

export async function getStorage() {
  const { metrics } = await chrome.storage.local.get(['metrics']);
  return metrics || {};
}

export async function saveStorage(metrics) {
  await chrome.storage.local.set({ metrics });
}
