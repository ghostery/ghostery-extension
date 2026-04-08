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

import { captureException } from '/utils/errors.js';

// By the specification, the storage.session.QUOTA_BYTES is set to 10MB
// so the threshold should be reached at 9MB.
const QUOTA_THRESHOLD = 0.9;

// Check session storage quota on startup to prevent issues with quota limits
(async function checkSessionStorageQuota() {
  try {
    const quotaBytes = chrome.storage.session.QUOTA_BYTES;
    if (!quotaBytes) return;

    const bytesInUse = await chrome.storage.session.getBytesInUse();
    const usage = bytesInUse / quotaBytes;

    if (usage >= QUOTA_THRESHOLD) {
      console.warn(
        `[storage] Session storage usage at ${(usage * 100).toFixed(1)}% (${bytesInUse}/${quotaBytes} bytes). Clearing session storage.`,
      );

      await chrome.storage.session.clear();

      captureException(
        new Error(
          `Session storage quota exceeded for ${quotaBytes} quota bytes. Cleared session storage to prevent issues.`,
        ),
        { critical: true, once: true },
      );
    }
  } catch (e) {
    console.error('[storage] Failed to check session storage quota:', e);
    captureException(e, { critical: true, once: true });
  }
})();
