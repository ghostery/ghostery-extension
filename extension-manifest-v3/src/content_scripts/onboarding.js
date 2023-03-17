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

import { showIframe } from '@ghostery/ui/onboarding/iframe';

let shownIframe = false;
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'contextual-onboarding') {
    if (msg.type === 'openIframe') {
      if (shownIframe) return false;

      showIframe(
        chrome.runtime.getURL('pages/contextual-onboarding/index.html'),
      );
      shownIframe = true;

      return false;
    }
  }

  return false;
});
