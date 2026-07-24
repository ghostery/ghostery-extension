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

// Ensures that `navigator.globalPrivacyControl` is truthy (GPC support):
// https://w3c.github.io/gpc/#javascript-property-to-detect-preference
//
// Injected into the page's MAIN world at document_start (including all frames).
// It must not rely on message passing to read the current settings, since the
// page must see the final value before any of its scripts run. Instead, the
// background registers or unregisters this content script when the GPC option
// changes (see background/never-consent/gpc.js).
(function () {
  try {
    if (!window.navigator.globalPrivacyControl) {
      Object.defineProperty(navigator, 'globalPrivacyControl', {
        get() {
          return true;
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch {
    // ignore
  }
})();
