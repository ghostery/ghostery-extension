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
import { COOKIE_DOMAIN } from '/utils/api.js';

const ALARM_NAME = 'session:sync';
const ALARM_REFRESH_RATE = 1 * 60; // 1 hour in minutes

// Observe cookie changes (login/logout actions)
chrome.cookies.onChanged.addListener(async ({ cookie, removed }) => {
  if (cookie.domain === COOKIE_DOMAIN && cookie.name === 'access_token') {
    if (!removed) {
      if (!(await chrome.alarms.get(ALARM_NAME))) {
        chrome.alarms.create(ALARM_NAME, {
          periodInMinutes: ALARM_REFRESH_RATE,
        });
      }

      store.clear(Options, false);
      store.get(Options);
    } else {
      chrome.alarms.clear(ALARM_NAME);
    }
  }
});

// Trigger options refresh on alarm
chrome.alarms.onAlarm.addListener(async ({ name }) => {
  if (name === ALARM_NAME) {
    store.clear(Options, false);
    store.get(Options);
  }
});
