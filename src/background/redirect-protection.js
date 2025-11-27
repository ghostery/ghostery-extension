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

import {
  REDIRECT_PROTECTION_SESSION_ID_RANGE,
  REDIRECT_PROTECTION_EXCEPTION_PRIORITY,
  REDIRECT_PROTECTION_ID_RANGE,
  getDynamicRulesIds,
  createRedirectProtectionExceptionRules,
} from '/utils/dnr.js';
import * as OptionsObserver from '/utils/options-observer.js';

function getRedirectUrlStorageKey(tabId) {
  return `redirectUrl_${tabId}`;
}

const allowedRedirectUrls = new Set();

export function getRedirectProtectionUrl(url, hostname, options) {
  if (allowedRedirectUrls.has(url)) {
    allowedRedirectUrls.delete(url);
    return undefined;
  }

  if (!options.redirectProtection.enabled) {
    return undefined;
  }

  if (
    Object.keys(options.redirectProtection.disabled).some((domain) =>
      hostname.endsWith(domain),
    )
  ) {
    return undefined;
  }

  return (
    chrome.runtime.getURL('pages/redirect-protection/index.html') +
    '?url=' +
    btoa(url)
  );
}

if (__PLATFORM__ === 'firefox') {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'allowRedirect') {
      if (!message.url) {
        sendResponse({ success: false, error: 'Missing URL' });
        return false;
      }

      try {
        allowedRedirectUrls.add(message.url);
        sendResponse({ success: true });
      } catch (error) {
        console.error('[redirect-protection] Error allowing redirect:', error);
        sendResponse({ success: false, error: error.message });
      }

      return false;
    }

    return false;
  });
} else {
  chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {
      if (
        details.frameId === 0 &&
        details.url &&
        !details.url.includes('redirect-protection')
      ) {
        chrome.storage.session
          .set({
            [getRedirectUrlStorageKey(details.tabId)]: details.url,
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
    chrome.storage.session
      .remove(getRedirectUrlStorageKey(tabId))
      .catch(() => {});

    chrome.declarativeNetRequest
      .updateSessionRules({
        removeRuleIds: [REDIRECT_PROTECTION_SESSION_ID_RANGE.start + tabId],
      })
      .catch(() => {});
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getRedirectUrl') {
      if (sender.tab && sender.tab.id) {
        const storageKey = getRedirectUrlStorageKey(sender.tab.id);
        chrome.storage.session
          .get(storageKey)
          .then((result) => {
            sendResponse({
              url: result[storageKey] || null,
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
          const urlPattern = `||${urlObj.host}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;

          await chrome.declarativeNetRequest.updateSessionRules({
            addRules: [
              {
                id: REDIRECT_PROTECTION_SESSION_ID_RANGE.start + tabId,
                priority: REDIRECT_PROTECTION_EXCEPTION_PRIORITY,
                action: { type: 'allow' },
                condition: {
                  urlFilter: urlPattern,
                  resourceTypes: ['main_frame'],
                  tabIds: [tabId],
                },
              },
            ],
            removeRuleIds: [REDIRECT_PROTECTION_SESSION_ID_RANGE.start + tabId],
          });

          await chrome.storage.session.remove(getRedirectUrlStorageKey(tabId));

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

    return false;
  });

  OptionsObserver.addListener(
    async function redirectProtectionExceptions(options, lastOptions) {
      if (options.redirectProtection.enabled) {
        const disabledDomains = Object.keys(
          options.redirectProtection.disabled,
        );
        const lastDisabledDomains = lastOptions
          ? Object.keys(lastOptions.redirectProtection.disabled)
          : [];

        const hasChanges =
          !lastOptions ||
          !lastOptions.redirectProtection.enabled ||
          JSON.stringify(disabledDomains.sort()) !==
            JSON.stringify(lastDisabledDomains.sort());

        if (hasChanges) {
          try {
            const removeRuleIds = await getDynamicRulesIds(
              REDIRECT_PROTECTION_ID_RANGE,
            );

            const addRules = createRedirectProtectionExceptionRules(
              disabledDomains,
              REDIRECT_PROTECTION_ID_RANGE.start,
            );

            await chrome.declarativeNetRequest.updateDynamicRules({
              removeRuleIds,
              addRules,
            });
          } catch (e) {
            console.error(
              '[redirect-protection] Error updating exception rules:',
              e,
            );
          }
        }
      } else if (lastOptions?.redirectProtection.enabled) {
        const removeRuleIds = await getDynamicRulesIds(
          REDIRECT_PROTECTION_ID_RANGE,
        );
        if (removeRuleIds.length) {
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds,
          });
        }
      }
    },
  );
}
