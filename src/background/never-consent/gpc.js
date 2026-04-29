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

import * as OptionsObserver from '/utils/options-observer.js';
import {
  GPC_RULE_ID,
  GPC_RULE_PRIORITY,
  ALL_RESOURCE_TYPES,
  getDynamicRulesByIds,
} from '/utils/dnr.js';
import Request from '/utils/request.js';

if (__CHROMIUM__) {
  async function updateGPCRule(options) {
    // Disabled GPC
    if (
      !options.terms ||
      !options.blockAnnoyances ||
      !options.autoconsent.gpc ||
      isGloballyPaused(options)
    ) {
      const existingRules = await getDynamicRulesByIds([GPC_RULE_ID]);
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

    const existingRules = await getDynamicRulesByIds([GPC_RULE_ID]);
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

if (__FIREFOX__) {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      const options = store.get(Options);
      if (
        !store.ready(options) ||
        !options.terms ||
        !options.blockAnnoyances ||
        !options.autoconsent.gpc ||
        isGloballyPaused(options)
      ) {
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
