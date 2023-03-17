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
import { session } from '../utils/api.js';

const ALARM_NAME = 'session:refresh';
const ALARM_REFRESH_RATE = 1000 * 60 * 24 * 30; // 30 days in milliseconds

export default {
  user: '',
  firstName: '',
  lastName: '',
  email: '',
  scopes: [String],
  contributor: ({ scopes }) => !!scopes.length,
  name: ({ firstName, lastName }) =>
    [firstName, lastName].filter((s) => s).join(' '),
  [store.connect]: {
    offline: true,
    async get() {
      try {
        const data = await session();

        return data
          ? {
              user: data.sub,
              firstName: data.first_name,
              lastName: data.last_name,
              email: data.email,
              scopes: data.scopes || [],
            }
          : {};
      } catch (e) {
        console.error("Failed to fetch user's session", e);
        return {};
      }
    },
    async observe(_, { user }) {
      if (user) {
        if (!(await chrome.alarms.get(ALARM_NAME))) {
          chrome.alarms.create(ALARM_NAME, {
            when: Date.now() + ALARM_REFRESH_RATE,
          });
        }
      } else {
        chrome.alarms.clear(ALARM_NAME);
      }
    },
  },
};

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    if (!(await session())) {
      chrome.alarms.clear(ALARM_NAME);
    } else {
      chrome.alarms.create(ALARM_NAME, {
        when: Date.now() + ALARM_REFRESH_RATE,
      });
    }
  }
});
