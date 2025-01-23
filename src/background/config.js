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

import Config, { ACTION_PAUSE_ASSISTANT } from '/store/config.js';
import Options from '/store/options.js';
import { CDN_URL } from '/utils/api.js';
import * as OptionsObserver from '/utils/options-observer.js';

import { openNotification } from './notifications.js';

const CONFIG_URL = CDN_URL + 'configs/v1.json';

function filter(item) {
  if (item.filter) {
    const { platform } = item.filter;
    let check = true;

    // Browser check
    if (check && Array.isArray(platform)) {
      check = platform.includes(__PLATFORM__);
    }

    return check;
  }

  return true;
}

const HALF_HOUR_IN_MS = 1000 * 60 * 30;

export default async function syncConfig() {
  const config = await store.resolve(Config);

  if (config.updatedAt > Date.now() - HALF_HOUR_IN_MS) {
    return;
  }

  // TODO: implement fetching remote config from the server
  // This is a mock of the fetched config
  try {
    const fetchedConfig = await fetch(CONFIG_URL).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch the remote config');
      return res.json();
    });

    // -- domains --

    const domains = { ...config.domains };

    // Clear out domains removed from the config
    for (const name of Object.keys(domains)) {
      if (fetchedConfig.domains[name] === undefined) {
        domains[name] = null;
      }
    }

    // Update the config with new values
    for (const [name, item] of Object.entries(fetchedConfig.domains)) {
      domains[name] = filter(item) ? item : null;
    }

    // -- flags --

    const flags = { ...config.flags };

    // Clear out flags removed from the config
    for (const name of Object.keys(flags)) {
      if (fetchedConfig.flags[name] === undefined) {
        flags[name] = null;
      }
    }

    // Update the config with the new values
    for (const [name, items] of Object.entries(fetchedConfig.flags)) {
      const item = items.find((item) => filter(item));
      if (!item) {
        flags[name] = null;
        continue;
      }
      // Generate local percentage only once for each flag
      const percentage =
        flags[name]?.percentage || Math.floor(Math.random() * 100) + 1;

      flags[name] = {
        percentage,
        enabled: percentage <= item.percentage,
      };
    }

    // Update the config
    store.set(Config, {
      updatedAt: Date.now(),
      domains,
      flags,
    });
  } catch (e) {
    console.error('[config] Failed to sync remote config:', e);
  }
}

OptionsObserver.addListener(function config({ terms }) {
  if (terms) syncConfig();
});

// Detect "pause" action and trigger pause assistant or feedback
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0) {
    const hostname = parse(details.url).hostname;
    if (hostname) {
      const [config, options] = await Promise.all([
        store.resolve(Config),
        store.resolve(Options),
      ]);

      if (
        config.hasAction(hostname, ACTION_PAUSE_ASSISTANT) &&
        !options.paused[hostname]
      ) {
        openNotification(details.tabId, 'pause', { hostname });
      }
    }
  }
});

const RELOAD_DELAY = 1 * 1000; // 1 second
const FEEDBACK_DELAY = 5 * 1000; // 5 seconds

// Listen to pause assistant messages
chrome.runtime.onMessage.addListener((msg, sender) => {
  switch (msg.action) {
    case 'config:pause:reload': {
      setTimeout(() => chrome.tabs.reload(sender.tab.id), RELOAD_DELAY);

      const cb = (details) => {
        if (details.frameId === 0 && details.tabId === sender.tab.id) {
          setTimeout(
            () => openNotification(sender.tab.id, 'pause-feedback'),
            FEEDBACK_DELAY,
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
