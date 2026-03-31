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

import { mount, store } from 'hybrids';

import '/ui/index.js';

import Config from '/store/config.js';
import Options from '/store/options.js';
import ManagedConfig from '/store/managed-config.js';

import Settings from './settings.js';

import './elements.js';
import './styles.css';

// As the user can access settings page from browser native UI
// we must redirect to onboarding if terms are not accepted
Promise.all([store.resolve(Options), store.resolve(ManagedConfig), store.resolve(Config)])
  .then(([{ terms }, managedConfig]) => {
    if (!__DEBUG__ && (!terms || managedConfig.disableUserControl)) {
      throw new Error('Access denied');
    }

    // Sync options with background
    chrome.runtime.sendMessage({ action: 'syncOptions' });

    mount(document.body, Settings);

    // This code keeps the services worker alive while the settings page is open to ensure that
    // changing options triggers an update keeping the old value of the option.
    // If the SW would be restarts because of the option change, the options observers
    // run as it would be a cold start.
    setInterval(() => chrome.runtime.sendMessage({ action: 'keepAlive' }), 15000);
  })
  .catch(() => {
    window.location.replace(chrome.runtime.getURL('/pages/onboarding/index.html'));
  });
