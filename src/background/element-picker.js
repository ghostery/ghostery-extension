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
import { parseFilters } from '@ghostery/adblocker';

import * as engines from '/utils/engines.js';
import ElementPickerSelectors from '/store/element-picker-selectors.js';
import Options from '/store/options.js';
import CustomFilters from '/store/custom-filters.js';

import { setup, reloadMainEngine } from './adblocker.js';
import { updateCustomFilters } from './custom-filters.js';

// Initialize element picker selectors
// to ensure that store.observe() is called
store.resolve(ElementPickerSelectors).then(async ({ hostnames }) => {
  // Migrate element picker selector from custom filters engine
  // TODO: Remove this migration after a few releases
  if (
    Object.keys(hostnames).length &&
    !(await engines.init(engines.ELEMENT_PICKER_ENGINE))
  ) {
    console.log(
      '[element-picker] Migrating selectors from custom filters engine...',
    );

    // Force refresh the element picker engine
    store.clear(ElementPickerSelectors, false);
    store.get(ElementPickerSelectors);

    // Refresh custom filters without element picker selectors
    const [options, customFilters] = await Promise.all([
      store.resolve(Options),
      store.resolve(CustomFilters),
    ]);

    updateCustomFilters(customFilters.text, options.customFilters);
  }
});

store.observe(ElementPickerSelectors, async (_, model, lastModel) => {
  if (!lastModel) return;

  let entries = Object.entries(model.hostnames);

  if (entries.length) {
    const elementPickerFilters = entries.reduce(
      (acc, [hostname, selectors]) => {
        for (const selector of selectors) {
          acc.push(`${hostname}##${selector}`);
        }
        return acc;
      },
      [],
    );

    const { cosmeticFilters } = parseFilters(elementPickerFilters.join('\n'));

    engines.create(engines.ELEMENT_PICKER_ENGINE, {
      cosmeticFilters,
      config: (await engines.init(engines.FIXES_ENGINE)).config,
    });
  } else {
    engines.remove(engines.ELEMENT_PICKER_ENGINE);
  }

  setup.pending && (await setup.pending);
  await reloadMainEngine();
});
