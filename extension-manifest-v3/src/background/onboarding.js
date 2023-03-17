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
import Options from '/store/options.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

(async function onboarding() {
  const options = await store.resolve(Options);
  const now = Date.now();

  if (
    !options.onboarding.done &&
    options.onboarding.shownAt < now - DAY_IN_MS
  ) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('/pages/onboarding/index.html'),
    });
  }
})();

function openIframe(tabId) {
  chrome.tabs.sendMessage(
    tabId,
    {
      action: 'contextual-onboarding',
      type: 'openIframe',
    },
    { frameId: 0 },
  );
}

// TODO: improve triggering based on tabStats
chrome.webNavigation.onCommitted.addListener((details) => {
  openIframe(details.tabId);
});
