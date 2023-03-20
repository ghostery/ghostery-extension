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

import AutoConsent from '@duckduckgo/autoconsent';
import { showIframe } from '@ghostery/ui/autoconsent/iframe';

if (document.contentType === 'text/html') {
  const consent = new AutoConsent((msg) => {
    return chrome.runtime.sendMessage(
      Object.assign({}, msg, { action: 'autoconsent' }),
    );
  });

  let shownIframe = false;
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'autoconsent') {
      if (msg.type === 'openIframe') {
        if (shownIframe) return false;

        showIframe(
          chrome.runtime.getURL(
            `pages/autoconsent/index.html?host=${encodeURIComponent(
              msg.domain,
            )}&default=${msg.defaultForAll ? 'all' : ''}`,
          ),
        );
        shownIframe = true;

        return false;
      }

      return Promise.resolve(consent.receiveMessageCallback(msg));
    }

    return false;
  });
}
