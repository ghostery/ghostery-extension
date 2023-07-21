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

import '@ghostery/ui/settings';
import { define, mount, store } from 'hybrids';

import Options from '/store/options.js';
import Settings from './settings.js';

// As the user can access settings page from browser native UI
// we must redirect to onboarding if terms are not accepted
const { terms } = await store.resolve(Options);

if (terms) {
  define.from(
    import.meta.glob('./**/*.js', { eager: true, import: 'default' }),
    {
      root: ['components', 'views'],
      prefix: 'gh-settings',
    },
  );

  mount(document.body, Settings);
} else {
  window.location.replace(
    chrome.runtime.getURL('/pages/onboarding/index.html'),
  );
}
