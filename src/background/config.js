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

import * as OptionsObserver from '/utils/options-observer.js';

const HALF_HOUR_IN_MS = 1000 * 60 * 30;

const USER_TESTING_DOMAINS = ['bbc.com'];

export default async function syncConfig() {
  const config = await store.resolve(Config);

  if (config.updatedAt > Date.now() - HALF_HOUR_IN_MS) {
    return;
  }

  return store.set(Config, {
    domains: USER_TESTING_DOMAINS.reduce((acc, domain) => {
      acc[domain] = { actions: ['pause-assistant'] };
      return acc;
    }, {}),
    flags: {
      'pause-assistant': {
        percentage: 100,
        enabled: true,
      },
    },
    updatedAt: Date.now(),
  });
}

OptionsObserver.addListener(function config({ terms }) {
  if (terms) syncConfig();
});
