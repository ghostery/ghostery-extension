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

import { DOMMonitor } from '@ghostery/adblocker-content';

import { delayedUpdateExtended } from './extended-selectors.js';

// Initial injection
chrome.runtime.sendMessage({ action: 'injectCosmetics', bootstrap: true });

// Monitor DOM changes
document.addEventListener(
  'DOMContentLoaded',
  () => {
    const DOM_MONITOR = new DOMMonitor((update) => {
      if (update.type === 'elements') {
        if (update.elements.length !== 0) {
          delayedUpdateExtended(update.elements);
        }
      } else {
        chrome.runtime.sendMessage({
          ...update,
          action: 'injectCosmetics',
        });
      }
    });

    DOM_MONITOR.queryAll(window);

    DOM_MONITOR.start(window);
  },
  { once: true, passive: true },
);
