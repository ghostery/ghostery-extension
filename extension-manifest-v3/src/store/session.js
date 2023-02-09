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
import * as api from '../utils/api.js';

const ALARM_NAME = 'session:refresh';
const REFRESH_RATE = 60 * 24 * 30; // 30 days in minutes

export default {
  user: '',
  firstName: '',
  lastName: '',
  email: '',
  contributor: false,
  name: ({ firstName, lastName }) => `${firstName} ${lastName}`,
  [store.connect]: {
    offline: true,
    async get() {
      const userId = await api.session();
      if (!userId) return {};

      const { data: user } = await api.get(`users/${userId.value}`);

      return {
        user: userId.value,
        firstName: user.attributes.first_name,
        lastName: user.attributes.last_name,
        email: user.attributes.email,
        contributor: !!user.attributes.scopes?.length,
      };
    },
    async observe(_, { user }) {
      if (user) {
        if (!(await chrome.alarms.get(ALARM_NAME))) {
          chrome.alarms.create(ALARM_NAME, {
            when: Date.now() + 1000 * REFRESH_RATE,
          });
        }
      } else {
        chrome.alarms.clear(ALARM_NAME);
      }

      // * Clear account data kept in earlier versions in local storage
      // * Remove alarm with old name
      // TODO: Remove this in a future release
      chrome.storage.local.set({ account: undefined });
      chrome.alarms.clear('account:refresh');
    },
  },
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    if (!api.session()) {
      chrome.alarms.clear(ALARM_NAME);
    } else {
      chrome.alarms.create(ALARM_NAME, {
        when: Date.now() + 1000 * REFRESH_RATE,
      });
    }
  }
});
