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

const permissionRequest = {
  permissions: ['offscreen'],
};

export async function requestPermission() {
  if (!(await chrome.permissions.contains(permissionRequest))) {
    if (!(await chrome.permissions.request(permissionRequest))) {
      throw new Error('Ghostery requires "offscreen" permission');
    }
  }
}
