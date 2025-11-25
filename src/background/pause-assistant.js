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

import Config from '/store/config.js';
import ManagedConfig from '/store/managed-config.js';
import Options, { FILTERING_MODE_GHOSTERY } from '/store/options.js';

import {
  ACTION_PAUSE_ASSISTANT,
  FLAG_PAUSE_ASSISTANT,
} from '/utils/config-types.js';
import * as OptionsObserver from '/utils/options-observer.js';

import { openNotification } from './notifications.js';

async function updatePausedDomains(config, lastConfig) {
  const managedConfig = await store.resolve(ManagedConfig);
  if (managedConfig.disableUserControl) return;

  const options = await store.resolve(Options);

  let paused = {};

  if (
    options.filteringMode !== FILTERING_MODE_GHOSTERY ||
    !options.pauseAssistant ||
    !config.hasFlag(FLAG_PAUSE_ASSISTANT)
  ) {
    // Clear out all paused domains by pause assistant
    for (const [domain, { assist }] of Object.entries(options.paused)) {
      if (assist) paused[domain] = null;
    }
  } else {
    // Add all domains with the action that weren't dismissed
    for (const [domain, { actions, dismiss }] of Object.entries(
      config.domains,
    )) {
      if (
        !dismiss[ACTION_PAUSE_ASSISTANT] &&
        actions.includes(ACTION_PAUSE_ASSISTANT)
      ) {
        paused[domain] = { revokeAt: 0, assist: true };
      }
    }

    // Remove domains that the action has been removed and user didn't interact
    // with the notification (no dismiss)
    if (lastConfig) {
      for (const id of Object.keys(lastConfig.domains)) {
        // The current config removed the action, but the previous one
        // had it and it wasn't dismissed (no user interaction)
        if (
          !config.hasAction(id, ACTION_PAUSE_ASSISTANT) &&
          lastConfig.hasAction(id, ACTION_PAUSE_ASSISTANT) &&
          !lastConfig.isDismissed(id, ACTION_PAUSE_ASSISTANT)
        ) {
          paused[id] = null;
        }
      }
    }
  }

  const keys = Object.keys(paused);
  if (keys.length) {
    store.set(Options, { paused });
    console.log(
      '[pause-assistant] Updating domains:',
      keys.map((k) => `${k}${paused[k] ? '(add)' : '(remove)'}`).join(', '),
    );
  }
}

// Update paused domains when the config changes
store.observe(Config, async (_, config, lastConfig) => {
  updatePausedDomains(config, lastConfig);
});

// Clear out domains when the user disables the pause assistant
// or changes filtering mode
OptionsObserver.addListener(
  async function pauseAssistant(options, lastOptions) {
    if (
      lastOptions &&
      (options.pauseAssistant !== lastOptions.pauseAssistant ||
        options.filteringMode !== lastOptions.filteringMode)
    ) {
      updatePausedDomains(await store.resolve(Config));
    }
  },
);

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0) {
    const managedConfig = await store.resolve(ManagedConfig);
    if (managedConfig.disableUserControl) return;

    const options = await store.resolve(Options);
    if (
      options.filteringMode !== FILTERING_MODE_GHOSTERY ||
      !options.pauseAssistant
    ) {
      return;
    }

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
