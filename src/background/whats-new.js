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

import Options, { WHATS_NEW_VERSION } from '/store/options.js';
import ManagedConfig from '/store/managed-config.js';

chrome.runtime.onStartup.addListener(async () => {
  console.log('[whats-new] Checking for new features...');

  const options = await store.resolve(Options);
  const managedConfig = await store.resolve(ManagedConfig);

  if (
    !options.terms ||
    managedConfig.disableUserControl ||
    options.whatsNewVersion === WHATS_NEW_VERSION
  ) {
    return;
  }

  chrome.tabs.create({
    url: chrome.runtime.getURL('pages/whats-new/index.html'),
  });
});
