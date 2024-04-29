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

const CustomFiltersInput = {
  text: '',
  [store.connect]: {
    async get() {
      const { customFiltersInput } = await chrome.storage.local.get([
        'customFiltersInput',
      ]);
      return {
        text: customFiltersInput,
      };
    },
    async set(_, { text }) {
      await chrome.storage.local.set({ customFiltersInput: text });
      return { text };
    },
  },
};

export default CustomFiltersInput;
