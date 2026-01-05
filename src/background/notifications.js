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

import ManagedConfig from '/store/managed-config.js';
import Options from '/store/options.js';

import { debugMode } from '/utils/debug.js';
import * as notifications from '/utils/notifications.js';

export async function openNotification({
  id,
  tabId,
  shownLimit = 0,
  delay,
  params,
  position,
}) {
  const options = await store.resolve(Options);
  const managedConfig = await store.resolve(ManagedConfig);

  const notification = options.notifications[id];

  if (
    // Terms not accepted
    !options.terms ||
    // Disabled notifications in managed config
    managedConfig.disableNotifications ||
    // Shown limit set and reached
    (shownLimit > 0 && notification?.shown >= shownLimit) ||
    // Delay set and notification shown recently
    (delay &&
      notification?.lastShownAt &&
      Date.now() - notification.lastShownAt < delay)
  ) {
    return false;
  }

  const url =
    chrome.runtime.getURL(`/pages/notifications/${id}.html`) +
    (params
      ? `?${Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&')}`
      : '');

  try {
    // Try to mount the notification in the specified tab
    const mounted = await chrome.tabs.sendMessage(tabId, {
      action: notifications.MOUNT_ACTION,
      url,
      position,
      debug: debugMode,
    });

    // Update notification stats if mounted successfully
    if (mounted) {
      await store.set(options, {
        notifications: {
          [id]: {
            shown: (notification?.shown || 0) + 1,
            lastShownAt: Date.now(),
          },
        },
      });

      console.log(
        `[notifications] Opened notification "${id}" with params:`,
        params,
      );
    }

    return mounted;
  } catch (e) {
    console.error(
      `[notifications] Failed to open notification "${id}" in tab:`,
      tabId,
      e,
    );

    return false;
  }
}

export function closeNotification(tabId) {
  return chrome.tabs.sendMessage(tabId, {
    action: notifications.UNMOUNT_ACTION,
  });
}

// Listen for notification actions from content scripts
chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;
  if (!tabId) return;

  switch (msg.action) {
    case notifications.OPEN_ACTION: {
      openNotification({ tabId, ...msg });
      break;
    }
    case notifications.CLOSE_ACTION: {
      closeNotification(tabId);
      break;
    }
  }
});
