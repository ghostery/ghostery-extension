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

import Options, { sync } from '/store/options.js';
import { UPDATE_SESSION_ACTION_NAME } from '/store/session.js';

import { session, ACCOUNT_PAGE_URL, SIGNON_PAGE_URL } from '/utils/api.js';

// Trigger options sync every hour
const ALARM_SYNC_OPTIONS = 'session:sync:options';
const ALARM_SYNC_OPTIONS_RATE = 1 * 60 * 24; // 1 day in minutes

// Try to check cookies every 30 days if the user is still logged in
const ALARM_UPDATE_SESSION = 'session:update';
const ALARM_UPDATE_SESSION_DELAY = 1000 * 60 * 24 * 30; // 30 days in milliseconds

async function syncOptions() {
  sync(await store.resolve(Options));
}

// Observe cookie changes (login/logout actions)
chrome.webNavigation.onDOMContentLoaded.addListener(async ({ url = '' }) => {
  if (url.includes(SIGNON_PAGE_URL) || url.includes(ACCOUNT_PAGE_URL)) {
    const user = await session().catch(() => null);

    if (user) {
      if (!(await chrome.alarms.get(ALARM_SYNC_OPTIONS))) {
        chrome.alarms.create(ALARM_SYNC_OPTIONS, {
          periodInMinutes: ALARM_SYNC_OPTIONS_RATE,
        });
      }

      if (!(await chrome.alarms.get(ALARM_UPDATE_SESSION))) {
        chrome.alarms.create(ALARM_UPDATE_SESSION, {
          when: Date.now() + ALARM_UPDATE_SESSION_DELAY,
        });
      }
    } else {
      chrome.alarms.clear(ALARM_SYNC_OPTIONS);
      chrome.alarms.clear(ALARM_UPDATE_SESSION);
    }

    syncOptions();

    // Send message to update session in other contexts
    chrome.runtime
      .sendMessage({ action: UPDATE_SESSION_ACTION_NAME })
      // The function only throws if the other end does not exist. Mainly, it happens
      // when the background process starts, but there is no other content script or
      // extension page, which could receive a message.
      .catch(() => null);
  }
});

chrome.alarms.onAlarm.addListener(async ({ name }) => {
  switch (name) {
    case ALARM_SYNC_OPTIONS:
      syncOptions();
      break;
    case ALARM_UPDATE_SESSION:
      if (!(await session())) {
        chrome.alarms.clear(ALARM_UPDATE_SESSION);
      } else {
        chrome.alarms.create(ALARM_UPDATE_SESSION, {
          when: Date.now() + ALARM_UPDATE_SESSION_DELAY,
        });
      }
      break;
    default:
      break;
  }
});
