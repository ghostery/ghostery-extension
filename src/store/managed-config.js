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

export const TRUSTED_DOMAINS_NONE_ID = '<none>';

const ManagedConfig = {
  disableOnboarding: false,
  disableUserControl: false,
  disableUserAccount: false,
  disableTrackersPreview: false,

  // TODO: Update the structure of `trustedDomains` as is with `customFilters`
  // to have `enabled` flag and `domains` array
  trustedDomains: [TRUSTED_DOMAINS_NONE_ID],
  customFilters: { enabled: false, filters: [String] },

  disableNotifications: (config) => config.disableOnboarding || config.disableUserControl,

  disableModes: (config) =>
    config.disableOnboarding ||
    config.disableUserControl ||
    config.trustedDomains[0] !== TRUSTED_DOMAINS_NONE_ID ||
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
        .catch(function (e) {
          // `e.message` equals `Managed storage manifest not found` here
          if (__FIREFOX__ && e?.message.includes('not found')) return {};
          throw e;
        });

      managedConfig ??= await managedConfigFromBackend;
    }

    // Translate `customFilters` storage.managed key (an array) to model structure
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
