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

const ALARM_NAME = 'account:refresh';
const REFRESH_RATE = 60 * 24 * 30; // 30 days in minutes

export default {
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  name: ({ firstName, lastName }) => `${firstName} ${lastName}`,
  [store.connect]: {
    async get() {
      try {
        const userId = await api.session();
        let { account } = await chrome.storage.local.get(['account']);

        if (!userId) {
          throw Error('Unauthorized');
        } else if (!account || account.userId !== userId.value) {
          const { data: user } = await api.get(`users/${userId.value}`);

          account = {
            userId: userId.value,
            firstName: user.attributes.first_name,
            lastName: user.attributes.last_name,
            email: user.attributes.email,
          };

          chrome.alarms.create(ALARM_NAME, {
            periodInMinutes: REFRESH_RATE,
            when: Date.now() + 1000 * REFRESH_RATE,
          });

          chrome.storage.local.set({ account });
        }

        return account;
      } catch (e) {
        chrome.alarms.clear(ALARM_NAME);
        chrome.storage.local.set({ account: undefined });

        throw e;
      }
    },
  },
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    if (!api.session()) {
      chrome.alarms.clear(ALARM_NAME);
    }
  }
});
