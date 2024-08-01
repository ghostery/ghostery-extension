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

import { observe, REGIONAL_FILTERS } from '/store/options.js';

// import * as engines from '/utils/engines.js';
import asyncSetup from '/utils/setup.js';

const enabledRegions = new Set();

asyncSetup([
  observe('regionalFilters', async (regionalFilters) => {
    for (const region of REGIONAL_FILTERS) {
      if (regionalFilters[region]) {
        enabledRegions.add(region);
      } else {
        enabledRegions.delete(region);
      }
    }
  }),
]);
