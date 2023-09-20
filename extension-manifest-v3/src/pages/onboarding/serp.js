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
import { setupIframe, closeIframe } from '@ghostery/ui/iframe';

import { openTabWithUrl } from '/utils/tabs.js';
import Options from '/store/options.js';

setupIframe(360);

async function updateOptions() {
  return store.resolve(Options).then((options) =>
    store.set(options, {
      onboarding: {
        serpShown: options.onboarding.serpShown + 1,
        serpShownAt: Date.now(),
      },
    }),
  );
}

async function enable(host, event) {
  openTabWithUrl(host, event);

  await updateOptions();
  closeIframe(false, true);
}

async function ignore() {
  await updateOptions();
  closeIframe(false, true);
}

mount(document.body, {
  content: () => html`
    <ui-onboarding-serp
      onenable="${enable}"
      onignore="${ignore}"
      href="https://www.ghostery.com/blog/block-search-engine-ads-on-opera"
    ></ui-onboarding-serp>
  `,
});
