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

// Initialize element picker selectors
// to ensure that store.observe() is called
store.resolve(ElementPickerSelectors);
