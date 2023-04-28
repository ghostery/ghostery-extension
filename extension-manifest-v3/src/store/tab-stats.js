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

const Tracker = {
  id: true,
  name: '',
  requests: [{ url: '', blocked: false }],
  category: 'unidentified',
  company: '',
  description: '',
  website: '',
  contact: '',
  privacyPolicy: '',
};

const Stats = {
  domain: '',
  trackers: [Tracker],
  categories: ({ trackers }) => trackers.map((t) => t.category),

  [store.connect]: {
    async get() {
      const currentTab =
        chrome.tabs &&
        (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

      const tabId =
        currentTab?.id ||
        (await chrome.runtime.sendMessage({
          action: 'getCurrentTabId',
        }));

      const storage = await chrome.storage.local.get(['tabStats:v1']);

      return storage['tabStats:v1']?.entries[tabId];
    },
    observe:
      __PLATFORM__ === 'safari' &&
      (() => {
        setTimeout(() => store.clear(Stats, false), 1000);
      }),
  },
};

export default Stats;

if (__PLATFORM__ !== 'safari') {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes['tabStats:v1']) {
      store.clear(Stats, false);
    }
  });
}
