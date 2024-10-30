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

import Options from '/store/options.js';
import Settings from './settings.js';

import './elements.js';

// As the user can access settings page from browser native UI
// we must redirect to onboarding if terms are not accepted
store
  .resolve(Options)
  .then(({ terms, managed }) => {
    if (!terms || managed) throw new Error('Access denied');

    // Safari has a bug where the back button doesn't work properly
    // when the page is loaded from a background page by the chrome.tabs.update API
    // In the result the `popstate` event is not fired and the router cannot
    // re-create the previous state correctly
    if (__PLATFORM__ === 'safari') {
      const backFn = history.back.bind(history);
      history.back = () => {
        setTimeout(backFn, 200);
      };
    }

    mount(document.body, Settings);
  })
  .catch(() => {
    window.location.replace(
      chrome.runtime.getURL('/pages/onboarding/index.html'),
    );
  });
