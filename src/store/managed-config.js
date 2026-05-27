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

const ManagedConfig = {
  disableOnboarding: false,
  disableUserControl: false,
  disableUserAccount: false,
  disableTrackersPreview: false,

  trustedDomains: { enabled: false, domains: [String] },
  customFilters: { enabled: false, filters: [String] },

  disableNotifications: (config) => config.disableOnboarding || config.disableUserControl,

  disableModes: (config) =>
    config.disableOnboarding ||
    config.disableUserControl ||
    config.trustedDomains.enabled ||
    config.customFilters.enabled,

  [store.connect]: async () => {
    if (__CHROMIUM__ && (isOpera() || isWebkit())) return {};

    try {
      // Firefox uses filesystem configuration on every platform
      // and throws if storage.managed is not available,
      // so we can skip fallback for it
      let managedConfig = await chrome.storage.managed.get().catch((e) => {
        // Allow fallback in debug mode (for e2e tests)
        if (__DEBUG__) return {};
        throw e;
      });

      // Chromium-based browsers just return an empty object,
      // and it might be available later (especially on the browser restart),
      // so we try to read it with fallback from local storage
      if (__CHROMIUM__ || __DEBUG__) {
        if (Object.keys(managedConfig).length) {
          // Save local version for fallback usage
          // Don't await - we don't need to block on this
          chrome.storage.local.set({ managedConfig });
        } else {
          // Try to get local version as fallback
          const { managedConfig: fallbackConfig = {} } =
            await chrome.storage.local.get('managedConfig');

          managedConfig = fallbackConfig;
        }
      }

      // Translate array storage.managed keys to model structure
      if (managedConfig.trustedDomains) {
        managedConfig.trustedDomains = {
          enabled: true,
          domains: managedConfig.trustedDomains,
        };
      }

      if (managedConfig.customFilters) {
        managedConfig.customFilters = {
          enabled: true,
          filters: managedConfig.customFilters,
        };
      }

      return managedConfig || {};
    } catch {
      return {};
    }
  },
};

export default ManagedConfig;
