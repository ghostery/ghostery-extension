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

const DOMContentLoaded = new Promise((resolve) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resolve, { once: true, passive: true });
  } else {
    resolve();
  }
});

// Initial injection
chrome.runtime.sendMessage({ action: 'injectCosmetics', bootstrap: true }).then((result) => {
  // If the `injectCosmetics` action returns explicitly `false`, it means that the injection
  // is disabled for this page, so we should not start the DOM monitor.
  if (result === false) return;

  DOMContentLoaded.then(() => {
    const monitor = new DOMMonitor((update) => {
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

    monitor.queryAll(window);
    monitor.start(window);
  });
});
