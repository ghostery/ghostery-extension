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

import Options, { observe, SYNC_OPTIONS } from '/store/options.js';
import {
  COOKIE_DOMAIN,
  getAccountOptions,
  setAccountOptions,
} from '/utils/api.js';

const ALARM_NAME = 'sync:options';
const ALARM_REFRESH_RATE = 1 * 60; // 1 hour in minutes

let revision;
export async function sync(options) {
  if (!options.terms || !options.sync || revision === options.revision) return;

  const serverOptions = await getAccountOptions();

  if (
    // Not logged in user
    serverOptions === null ||
    // Equal revisions
    serverOptions.revision === options.revision
  ) {
    return;
  }

  try {
    if (serverOptions.revision > options.revision) {
      revision = serverOptions.revision;
      await store.set(Options, serverOptions);
    } else {
      revision = options.revision;

      await setAccountOptions(
        SYNC_OPTIONS.reduce((acc, key) => {
          acc[key] = options[key];
          return acc;
        }, {}),
      );
    }
  } catch (e) {
    revision = undefined;
  }
}

// Observe options changes
observe(null, sync);

// Observe cookie changes (login/logout actions)
chrome.cookies.onChanged.addListener(async ({ cookie, removed }) => {
  if (cookie.domain === COOKIE_DOMAIN && cookie.name === 'access_token') {
    if (!removed) {
      if (!(await chrome.alarms.get(ALARM_NAME))) {
        chrome.alarms.create(ALARM_NAME, {
          periodInMinutes: ALARM_REFRESH_RATE,
        });
      }

      sync(await store.resolve(Options));
    } else {
      chrome.alarms.clear(ALARM_NAME);
    }
  }
});

chrome.alarms.onAlarm.addListener(async ({ name }) => {
  if (name === ALARM_NAME) sync(await store.resolve(Options));
});
