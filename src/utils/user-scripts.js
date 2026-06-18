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

export function isUserScriptsSupported() {
  // In debug builds (e.g. e2e tests) skip the guard, as the "Allow user
  // scripts" toggle cannot be enabled programmatically in the test browser.
  if (__DEBUG__) return true;

  try {
    chrome.userScripts.getScripts();
    return true;
  } catch {
    return false;
  }
}
