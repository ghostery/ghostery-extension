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
import { ACTION_DISABLE_GPC } from '@ghostery/config';

import Config from '/store/config.js';
import Options, { getPausedDetails, isGloballyPaused } from '/store/options.js';

import { addListener } from '/utils/options-observer.js';
import {
  GPC_RULE_ID,
  GPC_RULE_PRIORITY,
  ALL_RESOURCE_TYPES,
  getDynamicRulesByIds,
} from '/utils/dnr.js';
import Request from '/utils/request.js';

const GPC_CONTENT_SCRIPT_ID = 'gpc';

function shouldEnableGPC(options) {
  return (
    options.terms &&
    options.blockAnnoyances &&
    options.autoconsent.gpc &&
    !isGloballyPaused(options)
  );
}

function getExcludedDomains(options, config) {
  return [
    ...new Set([
      ...Object.keys(options.paused),
      ...Object.keys(config.domains).filter((domain) =>
        config.hasAction(domain, ACTION_DISABLE_GPC),
      ),
    ]),
  ];
}

// Match patterns cannot express IPv6 hosts or subdomains of IP addresses
function toExcludeMatches(domain) {
  if (domain.includes(':')) return [];
  if (/^[\d.]+$/.test(domain)) return [`*://${domain}/*`];
  return [`*://${domain}/*`, `*://*.${domain}/*`];
}

function isSameSet(a, b) {
  return a.length === b.length && a.every((value) => b.includes(value));
}

// The GPC spec requires exposing `navigator.globalPrivacyControl` to page
// scripts: https://w3c.github.io/gpc/#javascript-property-to-detect-preference
// Settings cannot be read at document_start, so the MAIN world script is
// registered while GPC is enabled and unregistered while it is disabled.
async function updateGPCContentScript(options) {
  const [registeredScript] = await chrome.scripting.getRegisteredContentScripts({
    ids: [GPC_CONTENT_SCRIPT_ID],
  });

  if (!shouldEnableGPC(options)) {
    if (registeredScript) {
      await chrome.scripting.unregisterContentScripts({
        ids: [GPC_CONTENT_SCRIPT_ID],
      });

      console.log('[autoconsent] GPC content script has been unregistered');
    }

    return;
  }

  const config = await store.resolve(Config);
  const excludeMatches = getExcludedDomains(options, config).flatMap(toExcludeMatches);

  if (registeredScript && isSameSet(registeredScript.excludeMatches ?? [], excludeMatches)) {
    return;
  }

  const contentScript = {
    id: GPC_CONTENT_SCRIPT_ID,
    js: ['/content_scripts/gpc.js'],
    matches: ['http://*/*', 'https://*/*'],
    excludeMatches,
    runAt: 'document_start',
    matchOriginAsFallback: true,
    allFrames: true,
    world: 'MAIN',
    persistAcrossSessions: true,
  };

  if (registeredScript) {
    await chrome.scripting.updateContentScripts([contentScript]);

    console.log('[autoconsent] GPC content script has been updated');
  } else {
    await chrome.scripting.registerContentScripts([contentScript]);

    console.log('[autoconsent] GPC content script has been registered');
  }
}

addListener(updateGPCContentScript);

store.observe(Config, async (_, config, lastConfig) => {
  if (lastConfig) {
    updateGPCContentScript(await store.resolve(Options));
  }
});

if (__CHROMIUM__) {
  async function updateGPCRule(options) {
    const [existingRule] = await getDynamicRulesByIds([GPC_RULE_ID]);

    if (!shouldEnableGPC(options)) {
      if (existingRule) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [GPC_RULE_ID],
        });

        console.log('[autoconsent] GPC rule has been removed');
      }

      return;
    }

    const config = await store.resolve(Config);
    const excludedDomains = getExcludedDomains(options, config);

    if (
      existingRule &&
      isSameSet(existingRule.condition.excludedInitiatorDomains ?? [], excludedDomains)
    ) {
      return;
    }

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [GPC_RULE_ID],
      addRules: [
        {
          id: GPC_RULE_ID,
          priority: GPC_RULE_PRIORITY,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [{ header: 'Sec-GPC', operation: 'set', value: '1' }],
          },
          condition: {
            ...(excludedDomains.length
              ? {
                  excludedInitiatorDomains: excludedDomains,
                  excludedRequestDomains: excludedDomains,
                }
              : {}),
            resourceTypes: ALL_RESOURCE_TYPES,
          },
        },
      ],
    });

    console.log('[autoconsent] GPC rule has been updated');
  }

  // Re-evaluate when Options change
  addListener(updateGPCRule);

  // Re-evaluate when remote Config changes (e.g. ACTION_DISABLE_GPC domains)
  store.observe(Config, async (_, config, lastConfig) => {
    if (lastConfig) {
      updateGPCRule(await store.resolve(Options));
    }
  });
}

if (__FIREFOX__) {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      const options = store.get(Options);
      if (!store.ready(options) || !shouldEnableGPC(options)) {
        return;
      }

      const request = Request.fromRequestDetails(details);
      const config = store.get(Config);
      const configReady = store.ready(config);

      // Mirror DNR's `excludedInitiatorDomains` + `excludedRequestDomains`:
      // skip if either the initiator (page) or the request hostname is paused
      // or has the disable action set.
      for (const hostname of [request.sourceHostname, request.hostname]) {
        if (!hostname) continue;
        if (getPausedDetails(options, hostname)) return;
        if (configReady && config.hasAction(hostname, ACTION_DISABLE_GPC)) return;
      }

      details.requestHeaders.push({ name: 'Sec-GPC', value: '1' });
      return { requestHeaders: details.requestHeaders };
    },
    { urls: ['http://*/*', 'https://*/*'] },
    ['blocking', 'requestHeaders'],
  );
}
