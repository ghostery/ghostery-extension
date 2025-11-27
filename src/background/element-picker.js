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

import { setup, reloadMainEngine } from './adblocker.js';

// Observe element picker selectors to update the adblocker engine
store.observe(ElementPickerSelectors, async (_, model, lastModel) => {
  let entries = Object.entries(model.hostnames);

  // Skip update if there is no change in the model
  if (!lastModel) {
    // and there is no entries, so engine is not needed
    if (!entries.length) return;
    // or engine already exists and it initializes correctly
    if (await engines.init(engines.ELEMENT_PICKER_ENGINE)) return;
  }

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
    await engines.create(engines.ELEMENT_PICKER_ENGINE, { cosmeticFilters });

    console.log(
      `[element-picker] Engine updated with ${
        elementPickerFilters.length
      } selectors for ${entries.length} hostnames`,
    );
  } else {
    engines.remove(engines.ELEMENT_PICKER_ENGINE);
    console.log('[element-picker] No selectors - engine removed');
  }

  setup.pending && (await setup.pending);
  await reloadMainEngine();
});

// Initialize element picker selectors
// to ensure that store.observe() is called
store.resolve(ElementPickerSelectors);
