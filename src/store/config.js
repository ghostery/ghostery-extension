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

const Config = {
  enabled: true,
  updatedAt: 0,
  domains: store.record({
    actions: [String],
    issueUrl: '',
    dismiss: store.record(false),
  }),
  flags: store.record({
    percentage: 0,
    enabled: false,
  }),

  // Helper methods

  hasAction({ domains, enabled }) {
    const hostnames = new Map();

    return (hostname, action) => {
      if (!enabled || !hostname) return;

      let actions = hostnames.get(hostname);
      if (!actions) {
        actions = new Map();
        hostnames.set(hostname, actions);
      }

      if (!actions.has(action)) {
        const domain = Object.keys(domains).find((d) => hostname.endsWith(d));
        const value = !!domain && domains[domain].actions.includes(action);

        actions.set(action, value);
        return value;
      }

      return actions.get(action);
    };
  },

  isDismissed({ domains, enabled }) {
    return (hostname, action) => {
      if (!enabled || !hostname) return;

      const domain = Object.keys(domains).find((d) => hostname.endsWith(d));
      if (!domain) return false;

      return !!domains[domain].dismiss[action];
    };
  },

  hasFlag({ flags, enabled }) {
    return (flag) => {
      if (!enabled || !flag || !flags[flag]) {
        return false;
      }

      return flags[flag].enabled;
    };
  },

  [store.connect]: {
    async get() {
      const { config = {} } = await chrome.storage.local.get(['config']);
      return config;
    },
    async set(_, values) {
      values ||= {};

      await chrome.storage.local.set({
        config: __FIREFOX__ ? JSON.parse(JSON.stringify(values)) : values,
      });
      return values;
    },
  },
};

chrome.storage.onChanged.addListener((changes) => {
  if (changes['config']) store.clear(Config, false);
});

export default Config;

export async function dismissAction(domain, action) {
  const config = await store.resolve(Config);
  const id = Object.keys(config.domains).find((d) => domain.endsWith(d));

  await store.set(Config, {
    domains: { [id]: { dismiss: { [action]: true } } },
  });
}

export function resolveFlag(id) {
  const promise = new Promise((resolve) => {
    store.resolve(Config).then(
      (config) => {
        const value = config.hasFlag(id);

        promise.enabled = value;
        resolve(value);
      },
      () => resolve(false),
    );
  });

  promise.enabled = false;
  return promise;
}
