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

observe('experimentalFilters', async (experimentalFilters) => {
  await engines.setEnv('env_experimental', experimentalFilters);

  // As engines on the server might have new filters, we need to update them
  engines.updateAll().catch(() => null);
});
