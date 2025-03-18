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
import Options, { getPausedDetails } from '/store/options.js';

import { openNotification } from './notifications.js';
import DOMAIN_LIST from '/DOMAIN_LIST.js';

// Detect "pause" action and trigger pause assistant or feedback
chrome.webNavigation.onCompleted.addListener(async (details) => {
  const config = await store.resolve(Config);
  if (!config.hasFlag(FLAG_PAUSE_ASSISTANT)) return;

  if (details.frameId === 0) {
    const hostname = parse(details.url).hostname;
    if (!hostname) return;

    const options = await store.resolve(Options);
    const paused = getPausedDetails(options, hostname);
    const hasAction = config.hasAction(hostname, ACTION_PAUSE_ASSISTANT);

    if (!paused) {
      if (hasAction) {
        // The site is not paused, but the domain with an action is in the config
        openNotification(details.tabId, 'pause-assistant', { hostname });
      }
    } else if (!hasAction && paused.assist) {
      // the site is paused with the assistant, but the domain is not in the config
      openNotification(details.tabId, 'pause-resume', { hostname });
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
          setTimeout(async () => {
            openNotification(sender.tab.id, 'pause-feedback', msg.params);
            setTimeout(async () => {
              const domain = parse(details.url).hostname;

              const config = await store.resolve(Config);
              const id = Object.keys(config.domains).find((d) =>
                domain.endsWith(d),
              );
              store.set(Config, { domains: { [id]: null } });

              DOMAIN_LIST.splice(DOMAIN_LIST.indexOf(domain), 1);

              await store.set(Options, { customFilters: { enabled: false } });
              await store.set(Options, { customFilters: { enabled: true } });
            }, 10000);
          }, msg.delay);
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
