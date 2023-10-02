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

export async function sendShowIframeMessage(tabId, url) {
  try {
    await chrome.tabs.sendMessage(
      tabId,
      { action: 'showIframe', url },
      { frameId: 0 },
    );
  } catch (e) {
    console.warn('Could not show iframe for tab', tabId, e);
  }
}
