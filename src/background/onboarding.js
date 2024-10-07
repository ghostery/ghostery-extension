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

import Options, { observe } from '/store/options.js';

observe('onboarding', ({ version, shownAt }) => {
  const currentVersion = Options.onboarding.version;

  if (version !== currentVersion) {
    store.set(Options, { onboarding: { version: currentVersion, shownAt: 0 } });
  } else if (!shownAt) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('/pages/onboarding/index.html'),
    });
  }
});
