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

import { define, mount, html, store, router } from 'hybrids';

import '/ui/index.js';

import Options from '/store/options.js';
import { getBrowserId } from '/utils/browser-info.js';

import Main from './views/main.js';
import Success from './views/success.js';

// Components
define.from(
  import.meta.glob('./components/*.js', { eager: true, import: 'default' }),
  { prefix: 'onboarding', root: 'components' },
);

store.resolve(Options).then(({ installDate, onboarding }) => {
  store.set(Options, {
    onboarding: {
      shownAt: Date.now(),
      shown: onboarding.shown + 1,
    },
    installDate,
  });
});

function updateOptions(host, event) {
  store.set(Options, {
    terms: event.detail.entry.id === Success.tag,
    onboarding: { done: true },
  });
}

mount(document.body, {
  platform: getBrowserId,
  stack: router([Main, Success], { params: ['platform'] }),
  render: {
    value: ({ stack }) => html`
      <template layout="grid height::100%">
        <onboarding-layout>${stack}</onboarding-layout>
      </template>
    `,
    connect: (host) => {
      host.addEventListener('navigate', updateOptions.bind(null, host));
    },
  },
});
