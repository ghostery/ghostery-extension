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
import Options from '/store/options.js';
import { GHOSTERY_DOMAIN } from '/utils/urls.js';

import './elements.js';

import Main from './views/main.js';
import Success from './views/success.js';

store.resolve(Options).then(({ onboarding, userSettings }) => {
  if (!userSettings) {
    return window.location.replace(`https://www.${GHOSTERY_DOMAIN}`);
  }

  store.set(Options, {
    onboarding: {
      shown: onboarding.shown + 1,
    },
  });

  mount(document.body, {
    stack: router([Main, Success]),
    render: ({ stack }) => html`
      <template layout="grid height::100%">
        <onboarding-layout>${stack}</onboarding-layout>
      </template>
    `,
  });
});
