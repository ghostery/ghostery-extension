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
  getDynamicRulesIds,
  getRedirectProtectionRules,
  CUSTOM_FILTERS_ID_RANGE,
  FIXES_ID_RANGE,
  MAX_RULE_PRIORITY,
  EXCEPTIONS_RULE_PRIORITY,
  REDIRECT_PROTECTION_ID_RANGE,
  REDIRECT_PROTECTION_EXCEPTIONS_ID_RANGE,
  REDIRECT_PROTECTION_SESSION_OFFSET,
} from '/utils/dnr.js';
import AutoSyncingMap from '/utils/map.js';
import * as OptionsObserver from '/utils/options-observer.js';

const REDIRECT_PROTECTION_PAGE_URL = chrome.runtime.getURL('pages/redirect-protection/index.html');

export async function updateRedirectProtectionRules(options) {
  if (options.redirectProtection.enabled) {
    const rules = (await chrome.declarativeNetRequest.getDynamicRules()).filter(
      (rule) =>
        (rule.id >= CUSTOM_FILTERS_ID_RANGE.start && rule.id < CUSTOM_FILTERS_ID_RANGE.end) ||
        (rule.id >= FIXES_ID_RANGE.start && rule.id < FIXES_ID_RANGE.end),
    );

    const addRules = getRedirectProtectionRules(rules).map((rule, index) => ({
      ...rule,
      id: REDIRECT_PROTECTION_ID_RANGE.start + index,
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: await getDynamicRulesIds(REDIRECT_PROTECTION_ID_RANGE),
      addRules,
    });

    console.info(
      `[redirect-protection] Updated redirect protection rules for custom filters and fixes: ${addRules.length}/${rules.length}`,
    );
  }
}

async function updateRedirectProtectionExceptions(options) {
  if (options.redirectProtection.enabled) {
    const hostnames = Object.keys(options.redirectProtection.exceptions);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: await getDynamicRulesIds(REDIRECT_PROTECTION_EXCEPTIONS_ID_RANGE),
      addRules: hostnames.map((hostname, index) => ({
        id: REDIRECT_PROTECTION_EXCEPTIONS_ID_RANGE.start + index,
        priority: EXCEPTIONS_RULE_PRIORITY,
        action: { type: 'allow' },
        condition: {
          urlFilter: `||${hostname}^`,
          resourceTypes: ['main_frame'],
        },
      })),
    });

    console.info('[redirect-protection] Updated exception rules for disabled domains');
  } else {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: await getDynamicRulesIds(REDIRECT_PROTECTION_EXCEPTIONS_ID_RANGE),
      addRules: [
        {
          id: REDIRECT_PROTECTION_EXCEPTIONS_ID_RANGE.start,
          priority: MAX_RULE_PRIORITY,
          action: { type: 'allow' },
          condition: {
            urlFilter: '*',
            resourceTypes: ['main_frame'],
          },
        },
      ],
    });

    console.info('[redirect-protection] Removed all exception rules as protection was disabled');
  }
}

const redirectUrlMap = new AutoSyncingMap({
  storageKey: 'redirectUrls:v1',
  ttlInMs: 5 * 60 * 1000,
});

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
    Object.keys(options.redirectProtection.exceptions).some((domain) => hostname.endsWith(domain))
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
  });

  OptionsObserver.addListener(
    'redirectProtection',
    async function redirectProtectionExceptions(redirectProtection, lastRedirectProtection) {
      if (!lastRedirectProtection) return;

      // Update exceptions on any change (enabled/disabled or domains)
      await updateRedirectProtectionExceptions({ redirectProtection });

      // If redirect protection was disabled, remove all rules
      if (!redirectProtection.enabled) {
        // Remove all redirect protection rules
        const ruleIds = await getDynamicRulesIds(REDIRECT_PROTECTION_ID_RANGE);

        if (ruleIds.length) {
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ruleIds,
          });

          console.info(
            `[redirect-protection] Removed all redirect protection rules: ${ruleIds.length}`,
          );
        }
      } else if (!lastRedirectProtection.enabled) {
        // Reload redirect protection rules, as it was just enabled
        await updateRedirectProtectionRules({ redirectProtection });
      }
    },
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (__PLATFORM__ !== 'firefox' && message.action === 'getRedirectUrl') {
    const url = sender.tab && sender.tab.id ? redirectUrlMap.get(sender.tab.id) || null : null;
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
        const id = REDIRECT_PROTECTION_SESSION_OFFSET + tabId;

        await chrome.declarativeNetRequest.updateSessionRules({
          addRules: [
            {
              id,
              priority: EXCEPTIONS_RULE_PRIORITY,
              action: { type: 'allow' },
              condition: {
                urlFilter: urlPattern,
                resourceTypes: ['main_frame'],
                tabIds: [tabId],
              },
            },
          ],
          removeRuleIds: [id],
        });

        redirectUrlMap.delete(tabId);

        sendResponse({ success: true });
      } catch (error) {
        console.error('[redirect-protection] Error creating session rule:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;
  }

  return false;
});
