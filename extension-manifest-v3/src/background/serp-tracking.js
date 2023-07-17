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

import { observe } from '/store/options.js';

import { domainList } from './utils/google.js';
import { toggleDynamicContentScript } from './utils/scripts.js';

observe('terms', async (terms) => {
  toggleDynamicContentScript(
    {
      id: 'serp-tracking',
      matches: domainList,
      js: ['/content_scripts/serp-tracking.js'],
    },
    terms,
  );
});
