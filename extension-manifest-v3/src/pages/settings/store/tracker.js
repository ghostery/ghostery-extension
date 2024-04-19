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

import TrackerException from '/store/tracker-exception.js';
import { getTracker, isCategoryBlockedByDefault } from '../../../utils/trackerdb.js';

export default {
  id: true,
  name: '',
  category: '',
  exception: TrackerException,
  organization: {
    id: true,
    name: '',
    country: '',
    websiteUrl: '',
    privacyPolicyUrl: '',
  },
  blockedByDefault: ({ category }) => isCategoryBlockedByDefault(category),
  [store.connect]: {
    async get(id) {
      // Load exceptions to memory
      await store.resolve([TrackerException]);

      return getTracker(id);
    },
  },
};
