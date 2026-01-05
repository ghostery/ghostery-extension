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

import { getBrowser, getOS, isWebkit } from '/utils/browser-info.js';

import { openNotification } from './notifications.js';
import { SURVEY_URL } from './onboarding.js';

const browser = getBrowser();
const os = getOS();

if (
  __PLATFORM__ !== 'firefox' &&
  browser.name !== 'oculus' &&
  os !== 'android' &&
  !isWebkit()
) {
  chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (
      details.frameId !== 0 ||
      (await chrome.action.getUserSettings()).isOnToolbar
    ) {
      return;
    }

    // Opened page is the onboarding survey
    if (details.url === SURVEY_URL) return;

    openNotification({
      id: 'pin-it',
      tabId: details.tabId,
      shownLimit: 1,
      position: 'center',
    });
  });
}
