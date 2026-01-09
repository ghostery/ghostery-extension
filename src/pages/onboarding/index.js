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

import { mount, html, store, router } from 'hybrids';

import '/ui/index.js';

import ManagedConfig from '/store/managed-config.js';
import Options from '/store/options.js';

import { HOME_PAGE_URL } from '/utils/urls.js';

import './elements.js';

import Main from './views/main.js';
import Modes from './views/modes.js';
import Success from './views/success.js';

Promise.all([store.resolve(Options), store.resolve(ManagedConfig)]).then(
  ([{ terms }, managedConfig]) => {
    // The user can access settings page from browser native UI
    // which redirects to onboarding. We must prevent showing onboarding
    // if it is disabled via managed config or user already accepted terms
    // when user control is disabled.
    if (
      managedConfig.disableOnboarding ||
      (terms && managedConfig.disableUserControl)
    ) {
      return window.location.replace(HOME_PAGE_URL);
    }

    store.set(Options, { onboarding: true });

    mount(document.body, {
      stack: router(terms ? [Success, Modes] : [Main, Modes, Success]),
      render: ({ stack }) => html`
        <template layout="grid height::100%">
          <ui-page-layout>${stack}</ui-page-layout>
        </template>
      `,
    });
  },
);
