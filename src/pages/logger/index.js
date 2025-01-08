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

import { mount, store } from 'hybrids';
import { Request } from '@ghostery/adblocker';

import * as engines from '/utils/engines.js';

import '/ui/index.js';
import Log from './store/log.js';
import Main from './views/main.js';

// This is a top level await, but it's fine as this is a page script
const engine = await engines.init(engines.MAIN_ENGINE);

// Register the logger tab
const port = chrome.runtime.connect({ name: 'logger' });

// Listen for requests from the background script
port.onMessage.addListener((message) => {
  if (message.action === 'logger:requests') {
    for (const data of message.requests) {
      const log = store.get(Log, data.id);
      delete data.id;

      const { filter } = engine.match(
        Request.fromRawDetails(data._originalRequestDetails),
      );

      data.filter = filter;
      store.set(log, data);
    }
  }
});

mount(document.body, Main);
