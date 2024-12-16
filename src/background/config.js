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

import Config from '/store/config.js';

function filter(item) {
  if (item.filter) {
    const { platform } = item.filter;
    let check = true;

    // Browser check
    if (check && Array.isArray(platform)) {
      check = platform.includes(__PLATFORM__);
    }

    return check;
  }

  return true;
}

// Fetch the remote config, update the local config
// with current domains and add new flags (not initialized yet)
(async function syncRemoteConfig() {
  // TODO: implement fetching remote config from the server
  // This is a mock of the fetched config
  const fetchedConfig = {
    'domains': {
      'ghostery.com': {
        'actions': ['assist'],
        'filter': {
          'platform': ['chromium'],
        },
      },
      'consent.google.pl': {
        'actions': ['disable-autoconsent'],
      },
    },
    'flags': {
      'assist': [
        {
          percentage: 100,
        },
      ],
      'firefox-content-script-scriptlets': [
        {
          'percentage': 20,
          'filter': {
            'platform': ['firefox'],
          },
        },
      ],
    },
  };

  const config = await store.resolve(Config);

  // -- domains --

  const domains = { ...config.domains };

  // Clear out domains removed from the config
  for (const name of Object.keys(domains)) {
    if (fetchedConfig.domains[name] === undefined) {
      domains[name] = null;
    }
  }

  // Update the config with new values
  for (const [name, item] of Object.entries(fetchedConfig.domains)) {
    domains[name] = filter(item) ? item : null;
  }

  // -- flags --

  const flags = { ...config.flags };

  // Clear out flags removed from the config
  for (const name of Object.keys(flags)) {
    if (fetchedConfig.flags[name] === undefined) {
      flags[name] = null;
    }
  }

  // Update the config with the new values
  for (const [name, items] of Object.entries(fetchedConfig.flags)) {
    const item = items.find((item) => filter(item));
    if (!item) {
      flags[name] = null;
      continue;
    }
    // Generate local percentage only once for each flag
    const percentage =
      flags[name]?.percentage || Math.floor(Math.random() * 100) + 1;

    flags[name] = {
      percentage,
      enabled: percentage <= item.percentage,
    };
  }

  // Update the config
  store.set(Config, { domains, flags });
})();
