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
import Session, { UPDATE_SESSION_ACTION_NAME } from '/store/session.js';
import { HOME_PAGE_URL, ACCOUNT_PAGE_URL } from '/utils/urls.js';
import { COOKIE_DOMAIN } from '/utils/api.js';

function refreshSession() {
  chrome.runtime
    .sendMessage({ action: UPDATE_SESSION_ACTION_NAME })
    .catch(() => null);
}

// Observe cookie changes (login/logout actions)
chrome.cookies.onChanged.addListener(async ({ cookie }) => {
  if (cookie.domain === COOKIE_DOMAIN && cookie.name === 'access_token') {
    refreshSession();
  }
});

async function retry(fn, retries = 10, delay = 1000) {
  if (!(await fn())) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay);
    }
  }
}

if (__PLATFORM__ === 'safari') {
  chrome.webNavigation.onDOMContentLoaded.addListener(async ({ url = '' }) => {
    // Safari on iOS 18.x has a bug where cookies are available to the extension with a significant delay
    // However, there is no event to listen to when the cookies are available, we need to poll
    // To avoid the same possible problem on macOS, we do it for all Safari platforms
    // TODO: Check if this is still needed after the next Safari release

    if (url === HOME_PAGE_URL) {
      // Check for logged out state
      await retry(() => store.resolve(Session).then(({ user }) => !user));
      refreshSession();
    } else if (url.includes(ACCOUNT_PAGE_URL)) {
      // Check for logged in state
      await retry(() => store.resolve(Session).then(({ user }) => user));
      refreshSession();
    }
  });
}
