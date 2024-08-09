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
import { parseFilters } from '@cliqz/adblocker';

import * as engines from '/utils/engines.js';

async function updateDNRRules(dnrRules) {
  const dynamicRules = (await chrome.declarativeNetRequest.getDynamicRules())
    .filter(({ id }) => id >= 1000000 && id < 2000000)
    .map(({ id }) => id);

  if (dynamicRules.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: dynamicRules,
      // ids between 1 and 2 million are reserved for dynamic rules
    });
  }

  if (dnrRules.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: dnrRules.map((rule, index) => ({
        ...rule,
        id: 1000000 + index,
      })),
    });
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'customFilters:engine') {
    console.groupCollapsed(
      'Custom filters: generating filters for provided input',
    );
    console.log(msg.filters);
    console.groupEnd();

    try {
      const {
        cosmeticFilters,
        networkFilters,
        preprocessors,
        notSupportedFilters,
      } = parseFilters(msg.filters);

      engines.createEngine(engines.CUSTOM_ENGINE, {
        cosmeticFilters,
        networkFilters,
        preprocessors,
      });

      sendResponse(
        notSupportedFilters.map(
          (msg) => `Filter not supported: '${msg.filter}'`,
        ),
      );
    } catch (e) {
      sendResponse([e]);
    }

    return false;
  }

  if (__PLATFORM__ !== 'firefox') {
    if (msg.action === 'customFilters:dnr') {
      updateDNRRules(msg.dnrRules).then(() =>
        sendResponse('DNR rules updated'),
      );
      return true;
    }
  }

  return false;
});
