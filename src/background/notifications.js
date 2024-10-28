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

import * as notifications from '/utils/notifications.js';

export function openNotification(tabId, id, params) {
  const url =
    chrome.runtime.getURL(`/pages/notifications/${id}.html`) +
    (params
      ? `?${Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&')}`
      : '');

  chrome.tabs.sendMessage(tabId, {
    action: notifications.MOUNT_ACTION,
    url,
  });
}

export function closeNotification(tabId) {
  chrome.tabs.sendMessage(tabId, {
    action: notifications.UNMOUNT_ACTION,
  });
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;
  if (!tabId) return;

  switch (msg.action) {
    case notifications.OPEN_ACTION: {
      openNotification(tabId, msg.id, msg.params);
      break;
    }
    case notifications.CLOSE_ACTION: {
      closeNotification(tabId);
      break;
    }
  }
});
