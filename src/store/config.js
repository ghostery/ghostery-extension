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

export const ACTION_DISABLE_AUTOCONSENT = 'disable-autoconsent';
export const ACTION_DISABLE_ANTITRACKING_MODIFICATION =
  'disable-antitracking-modification';
export const ACTION_ASSIST = 'assist';

export const FLAG_ASSIST = 'assist';
export const FLAG_FIREFOX_CONTENT_SCRIPT_SCRIPTLETS =
  'firefox-content-script-scriptlets';

const Config = {
  enabled: true,
  updatedAt: 0,
  domains: store.record({
    actions: [String],
  }),
  flags: store.record({
    percentage: 0,
    enabled: false,
  }),

  // Helper methods

  hasAction({ domains, enabled }) {
    return (hostname, action) => {
      if (!enabled) return;

      const domain = Object.keys(domains).find((d) => hostname.endsWith(d));
      return !!domain && domains[domain].actions.includes(action);
    };
  },

  hasFlag({ flags, enabled }) {
    return (flag) => enabled && !!(flag && flags[flag]?.enabled);
  },

  [store.connect]: {
    async get() {
      const { config = {} } = await chrome.storage.local.get(['config']);
      return config;
    },
    async set(_, values) {
      values ||= {};

      await chrome.storage.local.set({
        config:
          __PLATFORM__ === 'firefox'
            ? JSON.parse(JSON.stringify(values))
            : values,
      });
      return values;
    },
  },
};
export default Config;

chrome.storage.onChanged.addListener((changes) => {
  if (changes['config']) store.clear(Config, false);
});
