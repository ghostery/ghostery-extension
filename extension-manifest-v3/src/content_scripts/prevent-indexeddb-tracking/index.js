/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 * https://www.whotracks.me/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */
(function () {
  console.debug('Load indexeddb-tracking-protection');
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(
    'content_scripts/prevent-indexeddb-tracking/ghostery-prevent-indexeddb-tracking.js',
  );
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
})();
