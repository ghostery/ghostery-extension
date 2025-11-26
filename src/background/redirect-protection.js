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
 * Stores URLs before DNR redirects them, allowing the redirect protection
 * page to know what the original destination was.
 */

import { store } from 'hybrids';
import Options from '/store/options.js';
import {
  REDIRECT_PROTECTION_SESSION_ID_RANGE,
  REDIRECT_PROTECTION_SESSION_PRIORITY,
  REDIRECT_PROTECTION_ID_RANGE,
  REDIRECT_PROTECTION_EXCEPTION_PRIORITY,
  getDynamicRulesIds,
} from '/utils/dnr.js';

if (__PLATFORM__ !== 'firefox') {
  chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {
      if (
        details.frameId === 0 &&
        details.url &&
        !details.url.includes('redirect-protection')
      ) {
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

  chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.session.remove(`redirectUrl_${tabId}`).catch(() => {});

    chrome.declarativeNetRequest
      .updateSessionRules({
        removeRuleIds: [REDIRECT_PROTECTION_SESSION_ID_RANGE.start + tabId],
      })
      .catch(() => {});
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getRedirectUrl') {
      if (sender.tab && sender.tab.id) {
        chrome.storage.session
          .get(`redirectUrl_${sender.tab.id}`)
          .then((result) => {
            sendResponse({
              url: result[`redirectUrl_${sender.tab.id}`] || null,
            });
          })
          .catch(() => {
            sendResponse({ url: null });
          });
        return true;
      }
      sendResponse({ url: null });
      return false;
    }

    if (message.action === 'allowRedirect') {
      if (!sender.tab || !sender.tab.id || !message.url) {
        console.error(
          '[redirect-protection] Missing tab or URL in allowRedirect',
        );
        sendResponse({ success: false, error: 'Missing tab or URL' });
        return false;
      }

      const tabId = sender.tab.id;
      const url = message.url;

      (async () => {
        try {
          const urlObj = new URL(url);
          const domain = urlObj.hostname;

          await chrome.declarativeNetRequest.updateSessionRules({
            addRules: [
              {
                id: REDIRECT_PROTECTION_SESSION_ID_RANGE.start + tabId,
                priority: REDIRECT_PROTECTION_SESSION_PRIORITY,
                action: { type: 'allow' },
                condition: {
                  requestDomains: [domain],
                  resourceTypes: ['main_frame'],
                  tabIds: [tabId],
                },
              },
            ],
            removeRuleIds: [REDIRECT_PROTECTION_SESSION_ID_RANGE.start + tabId],
          });

          await chrome.storage.session.remove(`redirectUrl_${tabId}`);

          sendResponse({ success: true });
        } catch (error) {
          console.error(
            '[redirect-protection] Error creating session rule:',
            error,
          );
          sendResponse({ success: false, error: error.message });
        }
      })();

      return true;
    }

    if (message.action === 'disableRedirectProtection') {
      if (!message.hostname) {
        console.error(
          '[redirect-protection] Missing hostname in disableRedirectProtection',
        );
        sendResponse({ success: false, error: 'Missing hostname' });
        return false;
      }

      (async () => {
        try {
          const options = await store.resolve(Options);
          const disabled = options.redirectProtection?.disabled || [];

          if (disabled.includes(message.hostname)) {
            sendResponse({ success: true });
            return;
          }

          const newDisabled = [...disabled, message.hostname];
          await store.set(Options, {
            redirectProtection: {
              ...options.redirectProtection,
              disabled: newDisabled,
            },
          });

          const removeRuleIds = await getDynamicRulesIds(
            REDIRECT_PROTECTION_ID_RANGE,
          );

          const addRules = [];
          let ruleId = REDIRECT_PROTECTION_ID_RANGE.start;
          for (let i = 0; i < newDisabled.length; i += 1000) {
            const chunk = newDisabled.slice(i, i + 1000);
            addRules.push({
              id: ruleId++,
              priority: REDIRECT_PROTECTION_EXCEPTION_PRIORITY,
              action: { type: 'allow' },
              condition: {
                requestDomains: chunk,
                resourceTypes: ['main_frame'],
              },
            });
          }

          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds,
            addRules,
          });

          sendResponse({ success: true });
        } catch (error) {
          console.error(
            '[redirect-protection] Error disabling protection:',
            error,
          );
          sendResponse({
            success: false,
            error: error.message || String(error),
          });
        }
      })();

      return true;
    }

    return false;
  });
}
