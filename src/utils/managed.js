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
import { isOpera } from './browser-info.js';

let managed = __PLATFORM__ !== 'safari' && !isOpera() ? undefined : null;
export async function getManagedConfig() {
  if (managed === undefined) {
    try {
      managed = await chrome.storage.managed.get(null);

      // Some of the platforms returns an empty object if there are no managed options
      // so we need to check property existence that the managed options are enabled
      managed = Object.keys(managed).length > 0 ? managed : null;

      if (managed) {
        console.debug(`[options] Managed storage received:`, managed);
      }
    } catch {
      managed = null;
    }
  }

  return managed;
}
