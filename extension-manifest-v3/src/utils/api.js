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

import jwtDecode from 'jwt-decode';

const DOMAIN = 'ghostery.com';

const AUTH_URL = `https://consumerapi.${DOMAIN}/api/v2`;
const ACCOUNT_URL = `https://accountapi.${DOMAIN}/api/v2.1.0`;

export const COOKIE_DOMAIN = `.${DOMAIN}`;
const COOKIE_URL = `https://${DOMAIN}`;
const COOKIE_DURATION = 60 * 60 * 24 * 90; // 90 days in seconds
const COOKIE_SHORT_DURATION = 60 * 60 * 24; // 1 day in seconds

export const SIGNON_PAGE_URL = `https://signon.${DOMAIN}/`;
export const CREATE_ACCOUNT_PAGE_URL = `https://signon.${DOMAIN}/register`;
export const ACCOUNT_PAGE_URL = `https://account.${DOMAIN}/`;

async function isFirstPartyIsolation() {
  if (isFirstPartyIsolation.value === undefined) {
    try {
      await chrome.cookies.getAll({ domain: '' });
      isFirstPartyIsolation.value = false;
    } catch (e) {
      isFirstPartyIsolation.value = e.message.indexOf('firstPartyDomain') > -1;
    }
  }

  return isFirstPartyIsolation.value;
}

export async function getCookie(name) {
  const cookie = await chrome.cookies.get({
    url: COOKIE_URL,
    name,
    ...((await isFirstPartyIsolation()) ? { firstPartyDomain: DOMAIN } : {}),
  });

  return cookie?.value || undefined;
}

export async function setCookie(name, value, durationInSec = COOKIE_DURATION) {
  await chrome.cookies[value !== undefined ? 'set' : 'remove']({
    url: COOKIE_URL,
    domain: COOKIE_DOMAIN,
    path: '/',
    name,
    value,
    expirationDate: Date.now() / 1000 + durationInSec,
    ...((await isFirstPartyIsolation()) ? { firstPartyDomain: DOMAIN } : {}),
  });
}

export async function session() {
  const userId = await getCookie('user_id');
  if (!userId) return null;

  let accessToken = await getCookie('access_token');

  if (!accessToken) {
    const refreshToken = await getCookie('refresh_token');

    if (!refreshToken) {
      setCookie('user_id', undefined);
      setCookie('csrf_token', undefined);

      throw Error('Unauthorized');
    }

    const res = await fetch(`${AUTH_URL}/refresh_token`, {
      method: 'post',
      headers: {
        UserId: userId,
        RefreshToken: refreshToken,
      },
      credentials: 'omit',
    });

    if (res.ok) {
      const data = await res.json();
      accessToken = data.access_token;

      await Promise.all([
        setCookie('user_id', data.user_id),
        setCookie('refresh_token', data.refresh_token),
        setCookie('access_token', data.access_token, COOKIE_SHORT_DURATION),
        setCookie('csrf_token', data.csrf_token, COOKIE_SHORT_DURATION),
      ]);
    } else {
      throw res;
    }
  }

  return jwtDecode(accessToken);
}

export async function getUserOptions() {
  const userId = await getCookie('user_id');
  const accessToken = await getCookie('access_token');
  const csrfToken = await getCookie('csrf_token');

  const res = await fetch(`${ACCOUNT_URL}/options/${userId}`, {
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${accessToken}`,
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'omit',
  });

  if (!res.ok) {
    throw Error(`Failed to get options: ${res.status} ${res.statusText}`);
  }

  return (await res.json()).data.attributes.options || {};
}

export async function setUserOptions(options) {
  const userId = await getCookie('user_id');
  const accessToken = await getCookie('access_token');
  const csrfToken = await getCookie('csrf_token');

  const res = await fetch(`${ACCOUNT_URL}/options/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${accessToken}`,
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'omit',
    body: JSON.stringify({
      data: {
        type: 'options',
        id: userId,
        attributes: { options },
      },
    }),
  });

  if (!res.ok) {
    throw Error(`Failed to save options: ${res.status} ${res.statusText}`);
  }

  return (await res.json()).data.attributes.options || {};
}
