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
import { UPDATE_SESSION_ACTION_NAME } from '/store/session.js';

import { session, COOKIE_DOMAIN } from '/utils/api.js';

// Trigger options sync every hour
const ALARM_SYNC_OPTIONS = 'session:sync:options';
const ALARM_SYNC_OPTIONS_RATE = 1 * 60; // 1 hour in minutes

// Try to check cookies every 30 days if the user is still logged in
const ALARM_UPDATE_SESSION = 'session:update';
const ALARM_UPDATE_SESSION_DELAY = 1000 * 60 * 24 * 30; // 30 days in milliseconds

// Observe cookie changes (login/logout actions)
chrome.cookies.onChanged.addListener(async ({ cookie, removed }) => {
  if (cookie.domain === COOKIE_DOMAIN && cookie.name === 'access_token') {
    if (!removed) {
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

      store.clear(Options, false);
      store.get(Options);
    } else {
      chrome.alarms.clear(ALARM_SYNC_OPTIONS);
      chrome.alarms.clear(ALARM_UPDATE_SESSION);
    }

    // Send message to update session in other contexts
    chrome.runtime.sendMessage({ action: UPDATE_SESSION_ACTION_NAME });
  }
});

chrome.alarms.onAlarm.addListener(async ({ name }) => {
  if (name === ALARM_SYNC_OPTIONS) {
    store.clear(Options, false);
    store.get(Options);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_UPDATE_SESSION) {
    if (!(await session())) {
      chrome.alarms.clear(ALARM_UPDATE_SESSION);
    } else {
      chrome.alarms.create(ALARM_UPDATE_SESSION, {
        when: Date.now() + ALARM_UPDATE_SESSION_DELAY,
      });
    }
  }
});
