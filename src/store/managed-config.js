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
  trustedDomains: [String],

  [store.connect]: async () => {
    if (isOpera() || isWebkit()) return {};

    try {
      return (await chrome.storage.managed.get()) || {};
    } catch {
      return {};
    }
  },
};

export default ManagedConfig;
