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

const ACCOUNT_URL = 'https://accountapi.ghostery.com/api/v2.1.0';
const AUTH_URL = 'https://consumerapi.ghostery.com/api/v2';

const ALARM_NAME = 'account:refresh';
const REFRESH_RATE = 60 * 24 * 30; // 30 days

async function cookie(name) {
  const cookie = await chrome.cookies.get({
    url: 'https://ghostery.com',
    name,
    // TODO: Add firstPartyDomain support
    // firstPartyDomain: 'ghostery.com',
  });

  return cookie && cookie.value;
}

async function get(url, headers) {
  const csrfToken = await cookie('csrf_token');

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'X-CSRF-Token': csrfToken || undefined,
      ...headers,
    },
    credentials: 'include',
  });

  if (res.ok) {
    return res.json();
  }

  throw res;
}

async function session() {
  const userId = await cookie('user_id');
  if (!userId) return undefined;

  if (!(await cookie('access_token'))) {
    await fetch(`${AUTH_URL}/refresh_token`, {
      method: 'post',
      headers: {
        UserId: userId,
        RefreshToken: await cookie('refresh_token'),
      },
    });
  }

  return userId;
}

const Account = {
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  name: ({ firstName, lastName }) => `${firstName} ${lastName}`,
  [store.connect]: {
    async get() {
      let { account } = await chrome.storage.local.get(['account']);

      try {
        const userId = await session();

        if (!userId) {
          throw Error('Not found');
        } else if (!account || account.userId !== userId) {
          const { data: user } = await get(`${ACCOUNT_URL}/users/${userId}`);

          account = {
            userId,
            firstName: user.attributes.first_name,
            lastName: user.attributes.last_name,
            email: user.attributes.email,
          };

          chrome.storage.local.set({ account });
        }

        return account;
      } catch (e) {
        if (account) {
          chrome.storage.local.set({ account: undefined });
        }

        throw e;
      }
    },
    async observe(_, account) {
      if (account) {
        const alarm = await chrome.alarms.get('account');
        if (!alarm) {
          chrome.alarms.create(ALARM_NAME, {
            periodInMinutes: REFRESH_RATE,
            when: Date.now() + 1000 * REFRESH_RATE,
          });
        }
      } else {
        chrome.alarms.clear(ALARM_NAME);
      }
    },
  },
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    session();
  }
});

export default Account;
