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

import { UrlReporter } from '@whotracksme/reporting/reporting';

import { getBrowserInfo } from '/utils/browser-info.js';

import config from './config.js';
import communication from './communication.js';
import prefixedIndexedDBKeyValueStore from './storage-indexeddb.js';
import StorageLocal from './storage-chrome-local.js';

export default new UrlReporter({
  config: config.url,
  storage: new StorageLocal('reporting'),
  connectDatabase: prefixedIndexedDBKeyValueStore('reporting'),
  communication,
  browserInfoProvider: getBrowserInfo.getRawBrowserInfo,
});
