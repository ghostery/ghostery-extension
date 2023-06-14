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
import '../../utils/shims.js';

import { mount, html, store } from 'hybrids';
import '@ghostery/ui/onboarding';

import Options from '/store/options.js';

async function updateOptions(host, event) {
  const success = event.type === 'success';

  await store.set(Options, {
    ads: success,
    tracking: success,
    annoyances: success,
    terms: success,
    onboarding: { done: true },
  });

  chrome.runtime.sendMessage({
    action: 'telemetry',
    event: 'install_complete',
  });
}

mount(document.body, {
  content: () => html`
    <ui-onboarding
      platform="${__PLATFORM__}"
      onsuccess="${updateOptions}"
      onskip="${updateOptions}"
    ></ui-onboarding>
  `,
});

store.resolve(Options).then(({ installDate, onboarding }) => {
  // Get install date from `onboarding.shownAt` or generate current date
  if (!installDate) {
    installDate = (
      onboarding.shownAt ? new Date(onboarding.shownAt) : new Date()
    )
      .toISOString()
      .split('T')[0];
  }

  store.set(Options, {
    onboarding: {
      shownAt: Date.now(),
      shown: onboarding.shown + 1,
    },
    installDate,
  });
});
