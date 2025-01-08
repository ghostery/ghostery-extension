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
const ports = new Set();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'logger') {
    ports.add(port);

    const id = port.sender.tab.id;
    console.log('[logger] Connected logger with id', id);

    port.onDisconnect.addListener(() => {
      ports.delete(port);
      console.log('[logger] Disconnected logger with id', id);
    });
  }
});

export function send(requests) {
  for (const port of ports) {
    port.postMessage({ action: 'logger:requests', requests });
  }
}
