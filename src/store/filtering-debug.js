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

import { store } from 'hybrids';

import { safeForStorage } from '/utils/storage.js';

const STORAGE_KEY = 'filteringDebug';

// Session-scoped overrides; `true` means the capability is enabled (the default).
const FilteringDebug = {
  network: true,
  cosmeticsCSS: true,
  cosmeticsScriptlets: true,
  cosmeticsExtendedCSS: true,
  antitracking: true,
  autoconsent: true,
  [store.connect]: {
    async get() {
      const { [STORAGE_KEY]: values = {} } = await chrome.storage.session.get([STORAGE_KEY]);
      return values;
    },
    async set(_, values) {
      await chrome.storage.session.set({ [STORAGE_KEY]: safeForStorage(values) });
      return values;
    },
  },
};

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'session' && changes[STORAGE_KEY]) {
    store.clear(FilteringDebug, false);
  }
});

export default FilteringDebug;
