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

const CustomContentBlocks = {
  selectors: store.record([String]),
  [store.connect]: {
    get: async () => {
      const { customContentBlocks = {} } = await chrome.storage.local.get([
        'customContentBlocks',
      ]);
      return { selectors: customContentBlocks };
    },
    set: async (id, values) => {
      await chrome.storage.local.set({
        customContentBlocks:
          __PLATFORM__ === 'firefox'
            ? JSON.parse(JSON.stringify(values.selectors))
            : values.selectors,
      });
      return values;
    },
  },
};

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.customContentBlocks) {
    store.sync(CustomContentBlocks, {
      selectors: changes.customContentBlocks.newValue,
    });
  }
});

export default CustomContentBlocks;
