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

import { isOpera, isWebkit } from '/utils/browser-info.js';
import { debugMode } from '/utils/debug.js';

export const TRUSTED_DOMAINS_NONE_ID = '<none>';

const ManagedConfig = {
  disableOnboarding: false,
  disableUserControl: false,
  disableUserAccount: false,
  disableTrackersPreview: false,
  trustedDomains: [TRUSTED_DOMAINS_NONE_ID],

  disableNotifications: (config) =>
    config.disableOnboarding || config.disableUserControl,

  disableModes: (config) =>
    config.disableOnboarding ||
    config.disableUserControl ||
    config.trustedDomains[0] !== TRUSTED_DOMAINS_NONE_ID,

  [store.connect]: async () => {
    if (__PLATFORM__ !== 'firefox' && (isOpera() || isWebkit())) return {};

    try {
      // Firefox uses filesystem configuration on every platform
      // and throws if storage.managed is not available,
      // so we can skip fallback for it
      let managedConfig = await chrome.storage.managed.get().catch((e) => {
        // Allow fallback in debug mode (for e2e tests)
        if (debugMode) return {};
        throw e;
      });

      // Chromium-based browsers just return an empty object,
      // and it might be available later (especially on the browser restart),
      // so we try to read it with fallback from local storage
      if (__PLATFORM__ !== 'firefox' || debugMode) {
        if (Object.keys(managedConfig).length) {
          // Save local version for fallback usage
          // Don't await - we don't need to block on this
          chrome.storage.local.set({ managedConfig });
        } else {
          // Try to get local version as fallback
          const { managedConfig: fallbackConfig } =
            await chrome.storage.local.get('managedConfig');

          managedConfig = fallbackConfig;
        }
      }

      return managedConfig || {};
    } catch {
      return {};
    }
  },
};

export default ManagedConfig;
