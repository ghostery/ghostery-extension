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

const UPDATE_ACTION_NAME = 'updateOptions';

export function isUpdateOptionsMessage(message) {
  return message?.action === UPDATE_ACTION_NAME;
}

export const DNR_RULES_LIST = chrome.runtime
  .getManifest()
  .declarative_net_request.rule_resources.map((r) => r.id);

const Options = {
  dnrRules: DNR_RULES_LIST.reduce(
    (all, rule) => ({ ...all, [rule]: true }),
    {},
  ),
  trackerWheelDisabled: false,
  wtmSerpReport: true,
  [store.connect]: {
    async get() {
      const { options = {} } = await chrome.storage.local.get(['options']);
      return options;
    },
    async set(_, options) {
      await chrome.storage.local.set({ options });

      // Send update message to another contexts (background page / panel / options)
      await chrome.runtime.sendMessage({ action: UPDATE_ACTION_NAME });

      return options;
    },
    async observe(id, options) {
      // Ensure that DNR rulesets are equal to those from options.
      // eg. when web extension updates, the rulesets are reset
      // to the value from the manifest.

      const enabledRulesetIds =
        await chrome.declarativeNetRequest.getEnabledRulesets();

      const enableRulesetIds = [];
      const disableRulesetIds = [];

      DNR_RULES_LIST.forEach((rule) => {
        const enabled = options.dnrRules[rule];
        if (enabled !== enabledRulesetIds.includes(rule)) {
          if (enabled) {
            enableRulesetIds.push(rule);
          } else {
            disableRulesetIds.push(rule);
          }
        }
      });

      if (enableRulesetIds.length || disableRulesetIds.length) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds,
          disableRulesetIds,
        });
      }
    },
  },
};

export default Options;

chrome.runtime.onMessage.addListener((message) => {
  if (isUpdateOptionsMessage(message)) {
    const options = store.get(Options);

    if (!store.pending(options)) {
      store.clear(options, false);
      store.get(Options);
    }
  }

  return false;
});
