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

import '/ui/index.js';
import Log from './store/log.js';
import Main from './views/main.js';

// Register the logger tab
const port = chrome.runtime.connect({ name: 'logger' });

// Listen for requests from the background script
port.onMessage.addListener(async (msg) => {
  if (msg.action === 'logger:data') {
    try {
      for (const log of msg.data) {
        if (log.id) {
          const model = store.get(Log, log.id);

          delete log.id;
          store.set(model, log);
        } else {
          store.set(Log, log);
        }
      }
    } catch (error) {
      console.error('Error processing logs:', error);
    }
  }
});

mount(document.body, Main);
