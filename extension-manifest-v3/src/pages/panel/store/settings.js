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
import { rulesetIds } from '../utils/rulesets.js';

const Settings = {
  blockingStatus: rulesetIds.reduce(
    (all, toggle) => ({ ...all, [toggle]: false }),
    {},
  ),
  [store.connect]: {
    get: async () => {
      const enabledRulesetIds =
        await chrome.declarativeNetRequest.getEnabledRulesets();
      const settings = { blockingStatus: {} };

      enabledRulesetIds.forEach((type) => {
        settings.blockingStatus[type] = true;
      });
      return settings;
    },
    set: (_, settings) => settings,
  },
};

export async function toggleBlocking(rulesetId) {
  const settings = store.get(Settings);
  const currentStatus = settings.blockingStatus[rulesetId];

  store.set(Settings, {
    ...settings,
    blockingStatus: {
      ...settings.blockingStatus,
      [rulesetId]: !currentStatus,
    },
  });

  await chrome.declarativeNetRequest.updateEnabledRulesets({
    [currentStatus ? 'disableRulesetIds' : 'enableRulesetIds']: [rulesetId],
  });
  chrome.runtime.sendMessage({ action: 'dnrUpdate' });
}

export default Settings;
