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
import { debugMode } from '/utils/debug';

export default {
  supported: false,

  allowTerms: false,
  blockUserSettings: false,
  whitelistDomains: [String],

  [store.connect]: async () => {
    try {
      const values = await chrome.storage.managed.get(null);

      // Some of the platforms returns an empty object if there are no managed options
      // so we need to add a flag to indicate that the managed options are enabled
      if (Object.keys(values).length > 0) {
        values.supported = true;
      }

      return values;
    } catch (e) {
      if (debugMode) console.error(`Failed to get managed options`, e);
      return {};
    }
  },
};
