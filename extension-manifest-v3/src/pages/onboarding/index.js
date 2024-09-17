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

import { mount, html, store } from 'hybrids';
import '@ghostery/ui/onboarding';

import Options from '/store/options.js';
import { getBrowserId } from '/utils/browser-info.js';

async function updateOptions(host, event) {
  const success = event.type === 'success';

  await store.set(Options, {
    terms: success,
    onboarding: { done: true },
  });
}

mount(document.body, {
  render: () => html`
    <ui-onboarding
      platform="${getBrowserId()}"
      onsuccess="${updateOptions}"
      onskip="${updateOptions}"
    ></ui-onboarding>
  `,
});

store.resolve(Options).then(({ installDate, onboarding }) => {
  store.set(Options, {
    onboarding: {
      shownAt: Date.now(),
      shown: onboarding.shown + 1,
    },
    installDate,
  });
});
