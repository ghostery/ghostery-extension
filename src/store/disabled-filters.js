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

export const STORAGE_KEY = 'disabledFilterIds';

const DisabledFilters = {
  ids: [Number],
  [store.connect]: {
    async get() {
      const { [STORAGE_KEY]: ids = [] } = await chrome.storage.local.get([STORAGE_KEY]);
      return { ids };
    },
    async set(_, { ids = [] }) {
      await chrome.storage.local.set({ [STORAGE_KEY]: ids });
      return { ids };
    },
  },
};

chrome.storage.onChanged.addListener((changes) => {
  if (changes[STORAGE_KEY]) store.clear(DisabledFilters, false);
});

export default DisabledFilters;
