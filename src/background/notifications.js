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
import { FLAG_NOTIFICATION_REVIEW } from '@ghostery/config';

import Config from '/store/config.js';
import ManagedConfig from '/store/managed-config.js';
import Notification from '/store/notification.js';
import Options from '/store/options.js';

import { getOS, isOpera, isWebkit } from '/utils/browser-info.js';
import { debugMode } from '/utils/debug.js';
import * as notifications from '/utils/notifications.js';
import { isSerpSupported } from '/utils/opera.js';
import { checkStorage } from '/utils/storage.js';

import * as telemetry from './telemetry/index.js';
import { SURVEY_URL } from './onboarding.js';

export async function openNotification({ id, tabId, shownLimit = 0, delay, params, position }) {
  const options = await store.resolve(Options);
  const managedConfig = await store.resolve(ManagedConfig);

  const notification = await store.resolve(Notification, id).catch(() => null);

  if (
    // Terms not accepted
    !options.terms ||
    // Disabled notifications in managed config
    managedConfig.disableNotifications ||
    // Shown limit set and reached
    (shownLimit > 0 && notification?.shown >= shownLimit) ||
    // Delay set and notification shown recently
    (delay && notification?.lastShownAt && Date.now() - notification.lastShownAt < delay)
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
    await checkStorage();

    // Try to mount the notification in the specified tab
    const mounted = await chrome.tabs.sendMessage(tabId, {
      action: notifications.MOUNT_ACTION,
      url,
      position,
      debug: debugMode,
    });

    // Update notification stats if mounted successfully
    if (mounted) {
      await store.set(Notification, {
        id,
        shown: (notification?.shown || 0) + 1,
        lastShownAt: Date.now(),
      });

      console.log(`[notifications] Opened notification "${id}" with params:`, params);
    }

    return mounted;
  } catch (e) {
    console.error(`[notifications] Failed to open notification "${id}" in tab:`, tabId, e);

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

/*
  Pin It notification after first navigation (if not on toolbar)
*/

if (
  __PLATFORM__ !== 'firefox' &&
  !isWebkit() && // Safari
  getOS() !== 'android' // Edge on Android (and possibly other browsers)
) {
  chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (details.frameId !== 0 || (await chrome.action.getUserSettings()).isOnToolbar) {
      return;
    }

    // Opened page is the onboarding survey
    if (details.url === SURVEY_URL) return;

    openNotification({
      id: 'pin-it',
      tabId: details.tabId,
      shownLimit: 1,
      position: 'center',
    });
  });
}

/*
  Review notification after 30 days
*/

const REVIEW_NOTIFICATION_DELAY = 30 * 24 * 60 * 60 * 1000; // 30 days

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const { installDate } = await telemetry.getStorage();
  if (!installDate) return;

  const config = await store.resolve(Config);
  if (!config.hasFlag(FLAG_NOTIFICATION_REVIEW)) return;

  if (debugMode || Date.now() - new Date(installDate).getTime() >= REVIEW_NOTIFICATION_DELAY) {
    openNotification({
      id: 'review',
      tabId: details.tabId,
      shownLimit: 1,
      position: 'center',
    });
  }
});

/*
   Opera SERP notification if the protection is not enabled
*/

if (__PLATFORM__ !== 'firefox' && isOpera()) {
  const NOTIFICATION_DELAY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const NOTIFICATION_SHOW_LIMIT = 4;

  chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (details.frameId !== 0 || (await isSerpSupported())) return;

    openNotification({
      id: 'opera-serp',
      tabId: details.tabId,
      shownLimit: NOTIFICATION_SHOW_LIMIT,
      delay: NOTIFICATION_DELAY,
      position: 'center',
    });
  });
}
