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
import { getBrowser } from '/utils/browser-info.js';
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

if (__PLATFORM__ === 'chromium' && getBrowser().name === 'brave') {
  const BRAVE_SURVEY_URL =
    'https://blocksurvey.io/brave-browser-after-onboarding-x0NXNfJwTQaebdo2tzAd_A?v=o';

  OptionsObserver.addListener(
    'terms',
    async function braveSurvey(terms, lastTerms) {
      // Trigger only when user just have accepted terms
      if (lastTerms === false && terms === true) {
        const [tab] = await chrome.tabs.query({
          url: chrome.runtime.getURL('/pages/onboarding/index.html'),
        });

        const callback = async (tabId) => {
          if (tabId === tab?.id) {
            chrome.tabs.create({ url: BRAVE_SURVEY_URL, active: true });
            chrome.tabs.onRemoved.removeListener(callback);
          }
        };

        chrome.tabs.onRemoved.addListener(callback);
      }
    },
  );
}
