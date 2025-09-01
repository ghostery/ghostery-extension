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

import { getBrowser, getOS } from '/utils/browser-info.js';

import { openNotification } from './notifications.js';

const browser = getBrowser();
const os = getOS();

if (
  __PLATFORM__ === 'chromium' &&
  browser.name !== 'oculus' &&
  !(browser.name === 'edge' && (os === 'android' || os === 'ios'))
) {
  chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (
      details.frameId !== 0 ||
      (await chrome.action.getUserSettings()).isOnToolbar
    ) {
      return;
    }

    const { onboarding, terms } = await store.resolve(Options);
    const managedConfig = await store.resolve(ManagedConfig);

    if (
      // Terms not accepted
      !terms ||
      // Managed config disables the notification
      managedConfig.disableUserControl ||
      managedConfig.disableOnboarding ||
      // The notification was already shown
      onboarding.pinIt
    ) {
      return false;
    }

    openNotification({
      tabId: details.tabId,
      id: 'pin-it',
      position: 'center',
    });
  });
}
