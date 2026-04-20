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
import { UrlReporter } from '@whotracksme/reporting/reporting';

import Options, { getPausedDetails } from '/store/options.js';

import communication from './communication.js';
import config from './config.js';
import StorageLocal from './storage-chrome-local.js';
import prefixedIndexedDBKeyValueStore from './storage-indexeddb.js';

export default new UrlReporter({
  config: config.url,
  storage: new StorageLocal('reporting'),
  connectDatabase: prefixedIndexedDBKeyValueStore('reporting'),
  communication,

  pauseState: {
    getFilteringMode: () => store.get(Options).mode,
    isHostnamePaused: (hostname) => !!getPausedDetails(store.get(Options), hostname),
    connectHostnamePausingEvents: (notify) => {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'reporting:updateHostnamePause') {
          const { hostname, paused } = msg;
          notify({ hostname, paused });
        }
      });
    },
  },
});
