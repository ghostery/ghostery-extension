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

import { isSafari } from './browser-info.js';

export function isUserScriptsSupported() {
  // In debug builds (e.g. e2e tests) skip the guard, as the "Allow user
  // scripts" toggle cannot be enabled programmatically in the test browser.
  if (__DEBUG__) return true;

  // In Safari the API is not available, but we must return true
  // to bypass the check for the "Allow user scripts" toggle
  if (isSafari()) return true;

  try {
    chrome.userScripts.getScripts();
    return true;
  } catch {
    return false;
  }
}

// Real capability probe (no __DEBUG__ bypass) so a disabled "Allow user scripts"
// toggle falls back to the legacy executeScript injection path.
export function isUserScriptsRegisterSupported() {
  try {
    chrome.userScripts.getScripts();
    return typeof chrome.userScripts.register === 'function';
  } catch {
    return false;
  }
}
