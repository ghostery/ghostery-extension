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

const EXTENSION_ORIGIN = chrome.runtime.getURL('/').toLowerCase().slice(0, -1);

// A window message from the frame would give the page the extension origin
// and the frame's window, a private port gives it neither
export function addMessageListener(iframe, listener) {
  const { port1, port2 } = new MessageChannel();
  port1.onmessage = listener;

  iframe.addEventListener('load', () => {
    iframe.contentWindow.postMessage(null, EXTENSION_ORIGIN, [port2]);
  });
}

export function connectParent() {
  const port = new Promise((resolve) => {
    window.addEventListener('message', (event) => event.ports[0] && resolve(event.ports[0]));
  });

  return (message) => port.then((p) => p.postMessage(message));
}
