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

const Errors = {
  sentIds: store.record(false),
  [store.connect]: {
    async get() {
      const { errors = {} } = await chrome.storage.local.get('errors');
      return errors;
    },
    async set(_, errors) {
      await chrome.storage.local.set({ errors });
      return errors;
    },
  },
};

export default Errors;
