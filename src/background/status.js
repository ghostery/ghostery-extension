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

import { setup as adblockerSetup } from './adblocker/engines.js';

async function getStatus() {
  let adblockerReady = false;
  let adblockerError = null;
  try {
    if (adblockerSetup.pending) await adblockerSetup.pending;
    adblockerReady = true;
  } catch (e) {
    adblockerError = e.message || String(e);
  }
  const manifest = chrome.runtime.getManifest();
  return {
    ready: adblockerReady,
    adblocker: { ready: adblockerReady, error: adblockerError },
    version: manifest.version,
    id: chrome.runtime.id,
  };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.action !== 'status:get') return false;
  getStatus().then(sendResponse, (e) => sendResponse({ ready: false, error: e.message }));
  return true;
});
