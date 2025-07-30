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
import Options from '/store/options.js';

import { openNotification } from './notifications.js';

store.observe(Config, async (_, config) => {
  if (!config.hasFlag(FLAG_PAUSE_ASSISTANT)) return;
  if (!(await store.resolve(Options)).pauseAssistant) return;

  const paused = Object.entries(config.domains).reduce(
    (acc, [domain, { actions, dismiss }]) => {
      if (
        actions.includes(ACTION_PAUSE_ASSISTANT) &&
        !dismiss[ACTION_PAUSE_ASSISTANT]
      ) {
        acc = acc || {};
        acc[domain] = { revokeAt: 0, assist: true };
      }
      return acc;
    },
    null,
  );

  if (paused) {
    store.set(Options, { paused });
  }
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0) {
    if (!(await store.resolve(Options)).pauseAssistant) return;

    const config = await store.resolve(Config);
    if (!config.hasFlag(FLAG_PAUSE_ASSISTANT)) return;

    const hostname = parse(details.url).hostname;
    if (!hostname) return;

    const hasAction = config.hasAction(hostname, ACTION_PAUSE_ASSISTANT);

    if (hasAction && !config.isDismissed(hostname, ACTION_PAUSE_ASSISTANT)) {
      // The page is loaded, show the pause assistant notification
      openNotification({
        id: 'pause-assistant',
        tabId: details.tabId,
        position: 'center',
        params: { hostname },
      });
    } else {
      const options = await store.resolve(Options);
      const domain = Object.keys(options.paused).find((d) =>
        hostname.endsWith(d),
      );

      if (!hasAction && options.paused[domain]?.assist) {
        // The page is loaded, show the pause resume notification
        openNotification({
          id: 'pause-resume',
          tabId: details.tabId,
          params: { domain },
          position: 'center',
        });
      }
    }
  }
});
