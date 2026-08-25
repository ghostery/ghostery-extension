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

import { store } from 'hybrids';

import Options, { getPausedDetails } from '/store/options.js';

import { isUserScriptsSupported } from '/utils/user-scripts.js';
import { isSafari } from '/utils/browser-info.js';

import { openNotification, closeNotification } from './notifications.js';

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;
  if (!tabId || !sender.url) return false;

  const hostname = new URL(sender.url).hostname;

  switch (msg.action) {
    case 'youtube:ads': {
      console.log('[youtube] Ad detected while playing a video');
      (async () => {
        if (__CHROMIUM__ && !isSafari() && !isUserScriptsSupported()) {
          const options = await store.resolve(Options);

          if (__DEBUG__ || !getPausedDetails(options, hostname)) {
            openNotification({
              id: 'youtube-ads',
              tabId,
              params: { url: sender.url },
              shownLimit: 5,
              delay: 60 * 60 * 1000, // 1 hour
            });
          }
        }
      })();

      break;
    }

    case 'youtube:wall': {
      (async () => {
        // User's choice to not show the notification again
        const { youtubeDontAsk } = await chrome.storage.local.get(['youtubeDontAsk']);
        if (youtubeDontAsk) return;

        const options = await store.resolve(Options);
        if (getPausedDetails(options, hostname)) return;

        openNotification({ id: 'youtube-wall', tabId, params: { url: sender.url } });
      })();

      break;
    }

    case 'youtube:navigate': {
      closeNotification(tabId);
      break;
    }
  }

  return false;
});
