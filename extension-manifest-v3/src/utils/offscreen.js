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

export function isPermissionRequired() {
  // when run in the offscreen document, there is no `chrome.runtime.getManifest` so the module uses `createDocumentConverter`
  return (
    chrome &&
    (chrome.runtime.getManifest?.().permissions.includes('offscreen') ||
      chrome.runtime
        .getManifest?.()
        .optional_permissions?.includes('offscreen'))
  );
}

async function hasPermission() {
  return chrome.permissions.contains({
    permissions: ['offscreen'],
  });
}

export async function requestPermission() {
  if (!isPermissionRequired()) return;

  if (!(await hasPermission())) {
    await chrome.permissions.request({ permissions: ['offscreen'] });
    if (!(await hasPermission())) {
      throw new Error('Ghostery requires "offscreen" permission');
    }
  }
}
