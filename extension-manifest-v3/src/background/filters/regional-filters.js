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

import * as engines from '/utils/engines.js';

observe('regionalFilters', async (regionalFilters) => {
  // Fetch and update engines for enabled regions
  const engine = await engines.init(engines.REGIONAL_ENGINE);
  const regions = Object.entries(regionalFilters.regions)
    .filter(([, enabled]) => enabled)
    .map(([region]) => region);

  engine.setRegions(regions);
});
