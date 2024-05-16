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

import AnonymousCommunication from '@whotracksme/webextension-packages/packages/anonymous-communication';

import config from './config.js';
import prefixedIndexedDBKeyValueStore from './storage-indexeddb.js';
import ChromeStorage from './storage-chrome-local.js';

export default new AnonymousCommunication({
  config: config.url,
  storage: new ChromeStorage('communication'),
  connectDatabase: prefixedIndexedDBKeyValueStore('communication'),
});
