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

// Overwrite the declarativeNetRequest monkey patch for adguard library
// The check is redone in the background script
import './monkey-patch.js';

import convertWithAdguard from '@ghostery/urlfilter2dnr/adguard';

export async function convert(filters) {
  try {
    return await convertWithAdguard(filters);
  } catch (err) {
    console.error('Error converting filters:', err);
    return {
      rules: [],
      errors: [err],
    };
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'dnr-converter:convert') {
    convert(msg.filters).then(
      (result) => sendResponse(result),
      (err) => sendResponse({ rules: [], errors: [err.message] }),
    );

    return true;
  }
  return false;
});
