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
import { UPDATE_SESSION_ACTION_NAME } from '/store/session.js';
import { HOME_PAGE_URL, ACCOUNT_PAGE_URL } from '/utils/api.js';

// Observe cookie changes (login/logout actions)
chrome.webNavigation.onDOMContentLoaded.addListener(async ({ url = '' }) => {
  if (url === HOME_PAGE_URL || url.includes(ACCOUNT_PAGE_URL)) {
    // Send message to update session in other contexts
    chrome.runtime
      .sendMessage({ action: UPDATE_SESSION_ACTION_NAME })
      // The function only throws if the other end does not exist. Mainly, it happens
      // when the background process starts, but there is no other content script or
      // extension page, which could receive a message.
      .catch(() => null);
  }
});
