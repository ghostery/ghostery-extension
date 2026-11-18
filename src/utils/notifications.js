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

import { connectMessageEmitter } from './messaging.js';

// Actions to be used in the background script
export const OPEN_ACTION = 'notifications:open';
export const CLOSE_ACTION = 'notifications:close';

// Actions to be used in the content script
export const MOUNT_ACTION = 'notifications:mount';
export const UNMOUNT_ACTION = 'notifications:unmount';

// Action triggered by the content script
export const CLEAR_ACTION = 'notifications:clear';

// Events from the iframe page sent to the content script
export const RESIZE_WINDOW_EVENT = 'ghostery:notifications:resize';
export const CLOSE_WINDOW_EVENT = 'ghostery:notifications:close';

// Minimum time since installation to show the review notification
export const REVIEW_NOTIFICATION_DELAY = 30 * 24 * 60 * 60 * 1000; // 30 days

// The notification's own URL cannot tell where it is shown: any website can
// frame a notification with parameters of its choice
export const TAB_URL_ACTION = 'notifications:tab-url';

export function getTabUrl() {
  return chrome.runtime.sendMessage({ action: TAB_URL_ACTION });
}

/*
 * Setup the notification page to send messages to the parent window
 */
export function setupNotificationPage(width = 440) {
  const emitMessage = connectMessageEmitter();

  const resizeObserver = new ResizeObserver(() => {
    emitMessage({ type: RESIZE_WINDOW_EVENT, height: document.body.clientHeight, width });
  });

  resizeObserver.observe(document.body, { box: 'border-box' });
  document.body.style.overflow = 'hidden';

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === CLEAR_ACTION && location.pathname.split('/').pop() === msg.id) {
      emitMessage({ type: CLOSE_WINDOW_EVENT });
    }
  });

  return ({ clear = true, reload = false } = {}) => {
    // In some cases await for store.set() is not enough to propagate changes
    // so we need to wait a bit before sending the message
    setTimeout(() => {
      emitMessage({ type: CLOSE_WINDOW_EVENT, clear, reload });
    }, 100);
  };
}
