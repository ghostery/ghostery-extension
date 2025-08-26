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

import { getTracker, getSimilarTrackers } from '/utils/trackerdb.js';

import Organization from './organization.js';

const Tracker = {
  id: true,
  name: '',
  category: '',
  categoryDescription: '',
  organization: Organization,
  [store.connect]: {
    get: getTracker,
    list: ({ tracker: id }) => getSimilarTrackers(id),
  },
};

export default Tracker;
