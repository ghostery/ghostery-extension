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

import { define, html, store } from 'hybrids';
import '@ghostery/ui/onboarding';

import Options from '/store/options.js';

async function updateOptions(host, event) {
  const success = event.type === 'success';

  await store.set(Options, {
    engines: Object.keys(Options.engines).reduce(
      (all, rule) => ({ ...all, [rule]: success }),
      {},
    ),
    terms: success,
    onboarding: {
      done: true,
      shownAt: null,
    },
  });

  chrome.runtime.sendMessage({
    action: 'telemetry',
    event: 'install_complete',
  });
}

define({
  tag: 'gh-onboarding',
  content: () =>
    html`<ui-onboarding
      onsuccess="${updateOptions}"
      onskip="${updateOptions}"
    ></ui-onboarding>`,
});

store.resolve(Options).then((options) => {
  store.set(Options, {
    onboarding: {
      shownAt: Date.now(),
      shown: options.onboarding.shown + 1,
    },
  });
});
