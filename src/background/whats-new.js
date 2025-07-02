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
  console.log('[whats-new] Checking for new features...');

  const options = await store.resolve(Options);
  const managedConfig = await store.resolve(ManagedConfig);

  if (
    !options.terms ||
    managedConfig.disableUserControl // ||
    // parseFloat(options.whatsNewVersion) >= parseFloat(version)
  ) {
    return;
  }

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const activeTab = tabs.find((tab) => tab.active);

  let shown = false;

  if (tabs.length && activeTab?.url.startsWith('http')) {
    // There are tabs and the active tab is a web page, show the notification
    await openNotification({
      tabId: activeTab.id,
      id: 'whats-new',
      position: 'center',
    });
    shown = true;
  } else if (tabs.length <= 1 && !activeTab?.url.startsWith('http')) {
    // There are no tabs or the active tab is not a web page (blank, etc), open the what's new page
    await chrome.tabs.create({ url: WHATS_NEW_PAGE_URL, active: true });
    shown = true;
  }

  if (shown) store.set(options, { whatsNewVersion: version });
});
