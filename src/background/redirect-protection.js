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

import {
  REDIRECT_PROTECTION_SESSION_ID_RANGE,
  REDIRECT_PROTECTION_EXCEPTION_PRIORITY,
  REDIRECT_PROTECTION_ID_RANGE,
  getDynamicRulesIds,
  createRedirectProtectionExceptionRules,
} from '/utils/dnr.js';
import AutoSyncingMap from '/utils/map.js';
import * as OptionsObserver from '/utils/options-observer.js';

import Options from '/store/options.js';

const redirectUrlMap = new AutoSyncingMap({
  storageKey: 'redirectUrls:v1',
  ttlInMs: 5 * 60 * 1000,
});

const REDIRECT_PROTECTION_PAGE_URL = chrome.runtime.getURL(
  'pages/redirect-protection/index.html',
);

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

  return REDIRECT_PROTECTION_PAGE_URL + '?url=' + btoa(url);
}

if (__PLATFORM__ !== 'firefox') {
  chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {
      if (
        details.frameId === 0 &&
        details.url &&
        !details.url.startsWith(REDIRECT_PROTECTION_PAGE_URL)
      ) {
        redirectUrlMap.set(details.tabId, details.url);
      }
    },
    {
      url: [{ schemes: ['http', 'https'] }],
    },
  );

  chrome.tabs.onRemoved.addListener((tabId) => {
    redirectUrlMap.delete(tabId);

    chrome.declarativeNetRequest
      .updateSessionRules({
        removeRuleIds: [REDIRECT_PROTECTION_SESSION_ID_RANGE.start + tabId],
      })
      .catch(() => {});
  });

  OptionsObserver.addListener(
    'redirectProtection',
    async function redirectProtectionExceptions(
      redirectProtection,
      lastRedredirectProtection,
    ) {
      if (!lastRedredirectProtection) {
        return;
      }

      if (redirectProtection.enabled) {
        const disabledDomains = Object.keys(redirectProtection.disabled);

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

          console.log(
            '[redirect-protection] Updated exception rules for disabled domains:',
            disabledDomains,
          );
        } catch (e) {
          console.error(
            '[redirect-protection] Error updating exception rules:',
            e,
          );
        }
      } else if (lastRedredirectProtection.enabled) {
        const removeRuleIds = await getDynamicRulesIds(
          REDIRECT_PROTECTION_ID_RANGE,
        );
        if (removeRuleIds.length) {
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds,
          });

          console.log(
            '[redirect-protection] Removed all exception rules as protection was disabled',
          );
        }
      }
    },
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (__PLATFORM__ !== 'firefox' && message.action === 'getRedirectUrl') {
    const url =
      sender.tab && sender.tab.id
        ? redirectUrlMap.get(sender.tab.id) || null
        : null;
    sendResponse({ url });
    return false;
  }

  if (message.action === 'allowRedirect') {
    if (!message.url) {
      sendResponse({ success: false, error: 'Missing URL' });
      return false;
    }

    if (__PLATFORM__ === 'firefox') {
      allowedRedirectUrls.add(message.url);
      sendResponse({ success: true });
      return false;
    }

    if (!sender.tab || !sender.tab.id) {
      console.error('[redirect-protection] Missing tab in allowRedirect');
      sendResponse({ success: false, error: 'Missing tab' });
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

        redirectUrlMap.delete(tabId);

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

  if (message.action === 'alwaysAllowRedirect') {
    if (!message.hostname) {
      sendResponse({ success: false, error: 'Missing hostname' });
      return false;
    }

    store
      .set(Options, {
        redirectProtection: { disabled: { [message.hostname]: true } },
      })
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error(
          '[redirect-protection] Error disabling protection:',
          error,
        );
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  return false;
});
