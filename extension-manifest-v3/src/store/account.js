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

const API_URL = 'https://accountapi.ghostery.com/api/v2.1.0';

async function fetchApi(url, options) {
  const csrfToken = await getCookie('csrf_token');

  const res = await fetch(`${API_URL}/${url}`, {
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'include',
    ...options,
  });

  if (res.ok) {
    return res.json();
  }

  throw Error(res.statusText);
}

async function getCookie(name) {
  const cookie = await chrome.cookies.get({
    url: 'https://ghostery.com',
    name,
    // TODO: add firstPartyDomain support
    // firstPartyDomain: 'ghostery.com',
  });

  return cookie && cookie.value;
}

const Account = {
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  name: ({ firstName, lastName }) => `${firstName} ${lastName}`,
  [store.connect]: {
    async get() {
      const cookieUserId = await getCookie('user_id');
      let { account } = await chrome.storage.local.get(['account']);

      if (!cookieUserId) {
        if (account) chrome.storage.local.set({ account: undefined });
        throw Error('Not found');
      } else if (!account) {
        const { data: user } = await fetchApi(`users/${cookieUserId}`);

        account = {
          userId: cookieUserId,
          firstName: user.attributes.first_name,
          lastName: user.attributes.last_name,
          email: user.attributes.email,
        };
        chrome.storage.local.set({ account });
      }

      return account;
    },
  },
};

export default Account;
