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

const CustomFilters = {
  text: '',
  remoteUrls: store.record({
    text: '',
    name: '',
    lastUpdatedAt: 0,
    expires: 0,
    error: '',
  }),
  networkFilters: 0,
  cosmeticFilters: 0,
  dnrRules: 0,
  userScripts: false,
  errors: [String],
  [store.connect]: {
    cache: false,
    async get() {
      let { customFilters } = await chrome.storage.local.get(['customFilters']);

      // TODO: Remove migration from `customFiltersInput` after releasing this version
      if (!customFilters) {
        const { customFiltersInput } = await chrome.storage.local.get(['customFiltersInput']);
        if (customFiltersInput !== undefined) {
          customFilters = { text: customFiltersInput };
          await chrome.storage.local.set({ customFilters });
          await chrome.storage.local.remove('customFiltersInput');
        }
      }

      return customFilters || {};
    },
    async set(_, values) {
      await chrome.storage.local.set({
        // Firefox does not serialize correctly objects with getters
        customFilters: __FIREFOX__ ? JSON.parse(JSON.stringify(values)) : values,
      });

      return values;
    },
  },
};

chrome.storage.onChanged.addListener((changes) => {
  if (changes['customFilters']) {
    store.clear(CustomFilters, false);
  }
});

export default CustomFilters;
