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
import { debugMode } from '/utils/debug';
import * as OptionsObserver from '/utils/options-observer.js';

OptionsObserver.addListener('onboarding', (onboarding) => {
  if (!onboarding.shown) {
    // The onboarding page should not be shown in debug mode especially for the e2e tests
    // which fails if after initializing the extension additional tabs are opened
    if (debugMode) return;

    chrome.tabs.create({
      url: chrome.runtime.getURL('/pages/onboarding/index.html'),
    });
  }
});
