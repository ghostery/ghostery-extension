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

export const rulesetIds = chrome.runtime
  .getManifest()
  .declarative_net_request.rule_resources.map((r) => r.id);

export default {
  ...rulesetIds.reduce((all, toggle) => ({ ...all, [toggle]: false }), {}),
  [store.connect]: {
    async get() {
      const enabledRulesetIds =
        await chrome.declarativeNetRequest.getEnabledRulesets();
      const settings = {};

      enabledRulesetIds.forEach((type) => {
        settings[type] = true;
      });
      return settings;
    },
    async set(_, settings, keys) {
      for (const key of keys) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
          [settings[key] ? 'enableRulesetIds' : 'disableRulesetIds']: [key],
        });
      }

      chrome.runtime.sendMessage({ action: 'dnrUpdate' });

      return settings;
    },
  },
};
