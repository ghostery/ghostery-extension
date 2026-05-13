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

const node = document.getElementById('status');

async function probe() {
  const reply = await chrome.runtime.sendMessage({ action: 'status:get' });
  window.__ghosteryStatus = reply;
  node.textContent = JSON.stringify(reply, null, 2);
}

probe().catch((e) => {
  window.__ghosteryStatus = { error: e.message };
  node.textContent = `error: ${e.message}`;
});
