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

/**
 * Redirect Protection for Chrome/Safari (MV3)
 *
 * This module handles storing URLs before DNR redirects them and
 * managing user actions from the redirect protection page.
 */

import { store } from 'hybrids';
import Options from '/store/options.js';

if (__PLATFORM__ !== 'firefox') {
  // Store URLs before they get redirected by DNR
  // This allows the redirect protection page to know what the original URL was
  chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {
      // Only track main_frame navigations (not iframes)
      if (
        details.frameId === 0 &&
        details.url &&
        !details.url.includes('redirect-protection')
      ) {
        // Store the URL temporarily with the tab ID
        console.info('[redirect-protection] Storing URL for tab', details.tabId, ':', details.url);
        chrome.storage.session
          .set({
            [`redirectUrl_${details.tabId}`]: details.url,
          })
          .catch((err) => {
            console.error('[redirect-protection] Failed to store URL:', err);
          });
      }
    },
    {
      url: [{ schemes: ['http', 'https'] }],
    },
  );

  // Clean up storage when tab is closed
  chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.session
      .remove(`redirectUrl_${tabId}`)
      .catch(() => {});
  });

  // Handle messages from the redirect protection page
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getRedirectUrl') {
      // Redirect protection page is requesting the original URL
      if (sender.tab && sender.tab.id) {
        chrome.storage.session
          .get(`redirectUrl_${sender.tab.id}`)
          .then((result) => {
            sendResponse({ url: result[`redirectUrl_${sender.tab.id}`] || null });
          })
          .catch(() => {
            sendResponse({ url: null });
          });
        return true; // Keep channel open for async response
      }
    } else if (message.action === 'allowRedirect') {
      // User chose to continue to the site
      // Clean up the stored URL
      if (sender.tab && sender.tab.id) {
        chrome.storage.session
          .remove(`redirectUrl_${sender.tab.id}`)
          .catch(() => {});
      }
    } else if (message.action === 'disableRedirectProtection' && message.hostname) {
      // User chose to trust this site
      // Add the hostname to the disabled list
      store.resolve(Options).then((options) => {
        const disabled = options.redirectProtection?.disabled || [];
        if (!disabled.includes(message.hostname)) {
          store.set(Options, {
            redirectProtection: {
              ...options.redirectProtection,
              disabled: [...disabled, message.hostname],
            },
          });
        }
      });
    }
  });

  console.info('[redirect-protection] MV3 service initialized');
}
