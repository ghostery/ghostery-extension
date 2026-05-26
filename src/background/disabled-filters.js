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

import { STORAGE_KEY } from '/store/disabled-filters.js';

let ids = new Set();

chrome.storage.local.get([STORAGE_KEY]).then(({ [STORAGE_KEY]: stored = [] }) => {
  ids = new Set(stored);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes[STORAGE_KEY]) {
    ids = new Set(changes[STORAGE_KEY].newValue || []);
  }
});

export function isDisabled(filterId) {
  return ids.has(filterId);
}
