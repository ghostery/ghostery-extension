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

    // Try to get cached local version to mitigate slow Chrome
    // managed storage initialization.
    // We endure and expect the stale cache from local storage cache
    // as service worker will restart frequently.
    let { managedConfig } = await chrome.storage.local.get('managedConfig');

    // We will skip managed config in debug mode
    // Also this local storage overriding in e2e tests
    if (__DEBUG__) {
      managedConfig ??= {};
    } else {
      // Firefox throws if storage.managed is not found unlike Chrome
      // returning empty object
      const managedConfigFromBackend = chrome.storage.managed
        .get()
        .then(function (managedConfig) {
          chrome.storage.local.set({ managedConfig });
          return managedConfig;
        })
        .catch(function () {
          // We intend to catch all errors and make the function safe
          // Returning empty object here will handle every case
          return {};
        });

      managedConfig ??= await managedConfigFromBackend;
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

    return managedConfig;
  },
};

export default ManagedConfig;
