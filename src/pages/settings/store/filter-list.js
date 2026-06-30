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
import { msg, store } from 'hybrids';

import Options from '/store/options.js';

export default {
  id: true,
  url: '',
  [store.connect]: {
    async set(_, values) {
      const url = values.url.trim();

      if (!/^https?:/.test(url) || !URL.canParse(url)) {
        throw msg`The URL is invalid`;
      }

      const options = await store.resolve(Options);

      if (options.customFilters.filterLists[url]) {
        throw msg`The URL is already added`;
      }

      return { url };
    },
  },
};
