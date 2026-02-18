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

const ElementPickerSelectors = {
  hostnames: store.record([String]),
  [store.connect]: {
    get: async () => {
      const { elementPickerSelectors = {} } = await chrome.storage.local.get([
        'elementPickerSelectors',
      ]);
      return elementPickerSelectors;
    },
    set: async (id, values) => {
      await chrome.storage.local.set({
        elementPickerSelectors:
          __PLATFORM__ === 'firefox' ? JSON.parse(JSON.stringify(values)) : values,
      });

      return values;
    },
  },
};

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.elementPickerSelectors) {
    store.sync(ElementPickerSelectors, changes.elementPickerSelectors.newValue);
  }
});

export default ElementPickerSelectors;
