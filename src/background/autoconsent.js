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

import { evalSnippets, filterCompactRules } from '@duckduckgo/autoconsent';
import compactRules from '@duckduckgo/autoconsent/rules/compact-rules.json';
import { ACTION_DISABLE_AUTOCONSENT, ACTION_DISABLE_GPC } from '@ghostery/config';

import { store } from 'hybrids';

import Options, { getPausedDetails, isGloballyPaused } from '/store/options.js';
import * as OptionsObserver from '/utils/options-observer.js';
import Config from '/store/config.js';
import Resources from '/store/resources.js';
import { parseWithCache } from '/utils/request.js';
import {
  GPC_RULE_ID,
  GPC_RULE_PRIORITY,
  ALL_RESOURCE_TYPES,
  getDynamicRulesByIds,
} from '/utils/dnr.js';

async function initialize(msg, sender) {
  const [options, config] = await Promise.all([store.resolve(Options), store.resolve(Config)]);

  if (options.terms && options.blockAnnoyances) {
    const { tab, frameId } = sender;

    const senderUrl = sender.url || `${sender.origin}/`;
    const hostname = senderUrl ? parseWithCache(senderUrl).hostname : '';

    if (
      getPausedDetails(options, hostname) ||
      config.hasAction(hostname, ACTION_DISABLE_AUTOCONSENT)
    ) {
      return;
    }

    const compact = filterCompactRules(compactRules, {
      url: senderUrl,
      mainFrame: frameId === 0,
    });

    try {
      chrome.tabs.sendMessage(
        tab.id,
        {
          action: 'autoconsent',
          type: 'initResp',
          rules: { compact },
          config: {
            autoAction: options.autoconsent.autoAction,
            enableCosmeticRules: false,
            enableFilterList: false,
          },
        },
        { frameId },
      );
    } catch {
      // The error is thrown when the tab is not ready to receive messages,
      // like it is closed before the message is sent
    }
  }
}

async function evalCode(snippetId, id, tabId, frameId) {
  const [result] = await chrome.scripting.executeScript({
    target: {
      tabId,
      frameIds: [frameId],
    },
    world: chrome.scripting.ExecutionWorld?.MAIN ?? (__FIREFOX__ ? undefined : 'MAIN'),
    func: evalSnippets[snippetId],
  });

  await chrome.tabs.sendMessage(
    tabId,
    {
      action: 'autoconsent',
      id,
      type: 'evalResp',
      result: result.result,
    },
    {
      frameId,
    },
  );
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action !== 'autoconsent') return;
  if (!sender.tab) return;

  const frameId = sender.frameId;

  switch (msg.type) {
    case 'init':
      return initialize(msg, sender);
    case 'eval':
      return evalCode(msg.snippetId, msg.id, sender.tab.id, frameId);
    case 'optInResult':
    case 'optOutResult': {
      if (msg.result === true) {
        const { domain } = parseWithCache(sender.url);
        if (domain) {
          store.set(Resources, { autoconsent: { [domain]: Date.now() } });
        }
      }
      break;
    }
    default:
      break;
  }
});

if (__CHROMIUM__) {
  /*
   * Never-Consent GPC singl for Chromium
   */

  async function updateGPCRule(options) {
    const existingRules = await getDynamicRulesByIds([GPC_RULE_ID]);

    // Disabled GPC
    if (
      !options.terms ||
      !options.blockAnnoyances ||
      !options.autoconsent.gpc ||
      isGloballyPaused(options)
    ) {
      // Clear the GPC rule if it exists
      if (existingRules.length) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [GPC_RULE_ID],
        });

        console.log('[autoconsent] GPC rule has been removed');
      }

      // Return early, as no update is needed
      return;
    }

    const config = await store.resolve(Config);
    const excludedDomains = [
      ...new Set([
        ...Object.keys(options.paused),
        ...Object.keys(config.domains).filter((domain) =>
          config.hasAction(domain, ACTION_DISABLE_GPC),
        ),
      ]),
    ];

    if (existingRules.length) {
      const existingDomains = existingRules[0].condition.excludedInitiatorDomains || [];

      // The rule matches the expected configuration, so no update is needed
      if (
        existingDomains.length === excludedDomains.length &&
        existingDomains.every((d) => excludedDomains.includes(d))
      ) {
        return;
      }
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
  OptionsObserver.addListener(updateGPCRule);

  // Re-evaluate when remote Config changes (e.g. ACTION_DISABLE_GPC domains)
  store.observe(Config, async (_, config, lastConfig) => {
    if (lastConfig) {
      const options = await store.resolve(Options);
      updateGPCRule(options);
    }
  });
}
