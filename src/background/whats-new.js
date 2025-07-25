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
import ManagedConfig from '/store/managed-config.js';
import { WHATS_NEW_PAGE_URL } from '/utils/urls.js';

import { openNotification } from './notifications.js';

const { version } = chrome.runtime.getManifest();

chrome.runtime.onStartup.addListener(async () => {
  console.log('[whats-new] Checking for new minor version...');

  const options = await store.resolve(Options);
  const managedConfig = await store.resolve(ManagedConfig);
  const whatsNewVersion = parseFloat(version); // e.g., 10.5.0 -> 10.5

  if (
    !options.terms ||
    managedConfig.disableUserControl ||
    options.whatsNewVersion === whatsNewVersion
  ) {
    return;
  }

  // After installing the extension version is 0,
  // so we need to set it to the current version and return early
  if (options.whatsNewVersion === 0) {
    store.set(options, { whatsNewVersion });
    return;
  }

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const activeTab = tabs.find((tab) => tab.active);

  if (tabs.length && activeTab?.url.startsWith('http')) {
    // There are tabs and the active tab is a web page, show the notification
    await openNotification({
      tabId: activeTab.id,
      id: 'whats-new',
      position: 'center',
      params: { whatsNewVersion },
    });
  } else if (tabs.length <= 1 && !activeTab?.url.startsWith('http')) {
    // There are no tabs or the active tab is not a web page (blank, etc), open the what's new page
    await chrome.tabs.create({ url: WHATS_NEW_PAGE_URL, active: true });
    store.set(options, { whatsNewVersion });
  }
});
