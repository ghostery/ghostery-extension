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
import { parse } from 'tldts-experimental';

import Config, {
  ACTION_PAUSE_ASSISTANT,
  FLAG_PAUSE_ASSISTANT,
} from '/store/config.js';
import Options, { isPaused } from '/store/options.js';

import { openNotification } from './notifications.js';

// Detect "pause" action and trigger pause assistant or feedback
chrome.webNavigation.onCompleted.addListener(async (details) => {
  const config = await store.resolve(Config);
  if (!config.hasFlag(FLAG_PAUSE_ASSISTANT)) return;

  if (details.frameId === 0) {
    const options = await store.resolve(Options);
    const hostname = parse(details.url).hostname;

    const domain = isPaused(options, hostname);
    const pausedWithAssistant = domain && options.paused[domain]?.assist;

    const hasAction = config.hasAction(hostname, ACTION_PAUSE_ASSISTANT);

    if (pausedWithAssistant) {
      if (!hasAction) {
        // the site is paused with the assistant, but the domain is not in the config
        openNotification(details.tabId, 'pause-resume', { hostname });
      }
    } else if (hasAction) {
      // The site is not paused, but the domain with an action is in the config
      openNotification(details.tabId, 'pause-assistant', { hostname });
    }
  }
});

const RELOAD_DELAY = 1 * 1000; // 1 second

// Listen to pause assistant messages
chrome.runtime.onMessage.addListener((msg, sender) => {
  switch (msg.action) {
    case 'config:pause:reload': {
      setTimeout(() => chrome.tabs.reload(sender.tab.id), RELOAD_DELAY);

      const cb = (details) => {
        if (details.frameId === 0 && details.tabId === sender.tab.id) {
          setTimeout(
            () => openNotification(sender.tab.id, 'pause-feedback', msg.params),
            msg.delay,
          );
          chrome.webNavigation.onDOMContentLoaded.removeListener(cb);
        }
      };

      chrome.webNavigation.onDOMContentLoaded.addListener(cb);
      break;
    }
    case 'config:pause:feedback': {
      // TODO: handle feedback
    }
  }
});
