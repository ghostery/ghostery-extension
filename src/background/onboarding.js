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
import { FLAG_ONBOARDING_SURVEY } from '@ghostery/config';

import Config from '/store/config.js';
import Options from '/store/options.js';

import { isBrave } from '/utils/browser-info.js';
import { debugMode } from '/utils/debug';
import * as OptionsObserver from '/utils/options-observer.js';

export const SURVEY_URL =
  'https://blocksurvey.io/install-survey-postonboarding-R6q0d5dGR9OY6202iNPmGQ?v=o';

OptionsObserver.addListener('onboarding', async (onboarding) => {
  if (!onboarding.shown) {
    // The onboarding page should not be shown in debug mode especially for the e2e tests
    // which fails if after initializing the extension additional tabs are opened
    if (debugMode) return;

    const tab = await chrome.tabs.create({
      url: chrome.runtime.getURL('/pages/onboarding/index.html'),
    });

    if (!isBrave()) {
      // Add listener to show survey after onboarding tab is closed
      chrome.tabs.onRemoved.addListener(async function listener(closedTabId) {
        if (closedTabId === tab.id) {
          chrome.tabs.onRemoved.removeListener(listener);

          const config = await store.resolve(Config);
          const options = await store.resolve(Options);

          if (!options.terms || !config.hasFlag(FLAG_ONBOARDING_SURVEY)) {
            return;
          }

          chrome.tabs.create({ url: SURVEY_URL });
        }
      });
    }
  }
});
