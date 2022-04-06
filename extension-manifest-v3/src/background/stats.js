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
import AnonymousCommunication from '@whotracksme/webextension-packages/packages/anonymous-communication';
import Storage from '@whotracksme/webextension-packages/packages/anonymous-communication/storage';
import {
  getTimeAsYYYYMMDDHH,
  getTimeAsYYYYMMDD,
  getTrustedUtcTime,
} from '@whotracksme/webextension-packages/packages/anonymous-communication/timestamps';

const SERVER_URL = 'https://anonymous-communication.ghostery.net';
const CONFIG_URL = 'https://api.ghostery.net/api/v1/config';
const PUBLIC_KEYS_INDEXED_DB = 'anonymous-communication-public-keys';
const STORAGE_KEY = 'anonymous-communication-stats';
const HOUR = 1000 * 60 * 60;

async function send(protocol) {
  const now = getTrustedUtcTime();
  const ts = getTimeAsYYYYMMDD(now);
  const t = getTimeAsYYYYMMDDHH(now);

  const data = await chrome.storage.local.get([STORAGE_KEY]);
  const sentAt = Date.now();

  if (data[STORAGE_KEY] && sentAt + HOUR <= data[STORAGE_KEY].sentAt) {
    return;
  }

  const ctry = await fetch(CONFIG_URL)
    .then((res) => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then((res) => res.location);

  await protocol.send({
    action: 'wtm.alive',
    ver: 1,
    channel: 'safari',
    ts,
    payload: { t, ctry },
  });

  await chrome.storage.local.set({ [STORAGE_KEY]: { sentAt } });
}

(async function setupStats() {
  try {
    const storage = new Storage(PUBLIC_KEYS_INDEXED_DB);
    await storage.init();

    const protocol = new AnonymousCommunication({
      config: {
        COLLECTOR_DIRECT_URL: SERVER_URL,
        COLLECTOR_PROXY_URL: SERVER_URL,
      },
      storage,
    });

    send(protocol);

    /* Send stats in every hour of activity */
    setInterval(() => send(protocol), 1000 * 60 * 60);
  } catch (e) {
    console.error(`Failed to send stats: ${e}`);
  }
})();
