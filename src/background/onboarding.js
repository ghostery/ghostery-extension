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

import { SURVEY_POST_ONBOARDING_URL } from '/utils/urls.js';

import { isBrave } from '/utils/browser-info.js';
import * as OptionsObserver from '/utils/options-observer.js';

import { waitForConfigSync } from './config.js';

OptionsObserver.addListener('onboarding', async (onboarding) => {
  // Onboarding already shown
  if (onboarding) return;

  // The onboarding page should not be shown in debug mode especially for the e2e tests
  // which fails if after initializing the extension additional tabs are opened
  if (__DEBUG__) return;

  // TODO: Remove this after the `modes` flag is completed, as then the onboarding
  // page will not depend on the config and can be shown immediately
  await waitForConfigSync();

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

        chrome.tabs.create({ url: SURVEY_POST_ONBOARDING_URL });
      }
    });
  }
});
