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

  [store.connect]: async () => {
    if (isOpera() || isWebkit()) return {};

    try {
      if (debugMode) {
        const { debugManagedConfig } =
          await chrome.storage.local.get('debugManagedConfig');
        if (debugManagedConfig) return debugManagedConfig;
      }

      return (await chrome.storage.managed.get()) || {};
    } catch {
      return {};
    }
  },
};

export default ManagedConfig;
