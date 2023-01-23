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

const COOKIE_DOMAIN = '.ghostery.com';
const COOKIE_URL = 'https://ghostery.com';
const COOKIE_DURATION = 60 * 60 * 24 * 90; // 90 days in seconds

export async function get(name) {
  const cookie = await chrome.cookies.get({ url: COOKIE_URL, name });
  return cookie || null;
}

export async function set(name, value, durationInSec = COOKIE_DURATION) {
  await chrome.cookies[value !== undefined ? 'set' : 'remove']({
    url: COOKIE_URL,
    domain: COOKIE_DOMAIN,
    path: '/',
    name,
    value,
    expirationDate: Date.now() / 1000 + durationInSec,
  });
}
