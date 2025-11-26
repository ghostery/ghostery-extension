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
import Options from '/store/options.js';
import {
  REDIRECT_PROTECTION_SESSION_ID_RANGE,
  REDIRECT_PROTECTION_SESSION_PRIORITY,
  REDIRECT_PROTECTION_ID_RANGE,
  getDynamicRulesIds,
  createRedirectProtectionExceptionRules,
} from '/utils/dnr.js';

function getRedirectUrlStorageKey(tabId) {
  return `redirectUrl_${tabId}`;
}

async function updateOptionsWithDisabledHostname(hostname) {
  const options = await store.resolve(Options);
  const disabled = options.redirectProtection?.disabled || [];

  if (!disabled.includes(hostname)) {
    await store.set(Options, {
      redirectProtection: {
        ...options.redirectProtection,
        disabled: [...disabled, hostname],
      },
    });
  }

  return disabled.includes(hostname) ? disabled : [...disabled, hostname];
}

const allowedRedirectUrls = new Set();

function shouldProtectRedirect(options, hostname) {
  if (!options.redirectProtection?.enabled) {
    return false;
  }

  const disabledDomains = options.redirectProtection.disabled || [];
  return !disabledDomains.some((domain) => hostname.endsWith(domain));
}

export function handleRedirectProtection(
  details,
  request,
  options,
  isTrusted,
  getEngine,
  updateTabStats,
) {
  if (details.type !== 'main_frame') {
    return undefined;
  }

  const hostname = request.hostname;

  if (allowedRedirectUrls.has(details.url)) {
    allowedRedirectUrls.delete(details.url);
    return undefined;
  }

  if (
    !shouldProtectRedirect(options, hostname) ||
    isTrusted(request, details.type)
  ) {
    return undefined;
  }

  const engine = getEngine();
  const { redirect, match } = engine.match(request);

  if (match === true || redirect !== undefined) {
    request.blocked = true;
    updateTabStats(details.tabId, [request]);

    const encodedUrl = btoa(details.url);
    const protectionUrl =
      chrome.runtime.getURL('pages/redirect-protection/index.html') +
      '?url=' +
      encodedUrl;

    return { redirectUrl: protectionUrl };
  }

  return undefined;
}

export function allowRedirectUrl(url) {
  allowedRedirectUrls.add(url);
}

export async function disableRedirectProtectionForHostname(hostname) {
  await updateOptionsWithDisabledHostname(hostname);
}

if (__PLATFORM__ === 'firefox') {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'allowRedirect') {
      if (!message.url) {
        sendResponse({ success: false, error: 'Missing URL' });
        return false;
      }

      try {
        allowRedirectUrl(message.url);
        sendResponse({ success: true });
      } catch (error) {
        console.error('[redirect-protection] Error allowing redirect:', error);
        sendResponse({ success: false, error: error.message });
      }

      return false;
    }

    if (message.action === 'disableRedirectProtection') {
      if (!message.hostname) {
        sendResponse({ success: false, error: 'Missing hostname' });
        return false;
      }

      disableRedirectProtectionForHostname(message.hostname, Options)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error(
            '[redirect-protection] Error disabling protection:',
            error,
          );
          sendResponse({
            success: false,
            error: error.message || String(error),
          });
        });

      return true;
    }

    return false;
  });
}

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
                priority: REDIRECT_PROTECTION_SESSION_PRIORITY,
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
          const newDisabled = await updateOptionsWithDisabledHostname(
            message.hostname,
          );

          const removeRuleIds = await getDynamicRulesIds(
            REDIRECT_PROTECTION_ID_RANGE,
          );

          const addRules = createRedirectProtectionExceptionRules(
            newDisabled,
            REDIRECT_PROTECTION_ID_RANGE.start,
          );

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
