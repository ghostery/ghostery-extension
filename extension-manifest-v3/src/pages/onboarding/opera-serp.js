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
  const options = await store.resolve(Options);

  return store.set(options, {
    onboarding: {
      serpShown: options.onboarding.serpShown + 1,
      serpShownAt: Date.now(),
    },
  });
}

async function enable(host, event) {
  try {
    openTabWithUrl(host, event);
    await updateOptions();

    closeIframe(false, true);
  } catch (e) {
    document.body.outerHTML = '';
  }
}

async function ignore() {
  try {
    await updateOptions();

    closeIframe(false, true);
  } catch (e) {
    document.body.outerHTML = '';
  }
}

mount(document.body, {
  content: () => html`
    <ui-onboarding-serp
      onenable="${enable}"
      onignore="${ignore}"
      href="https://www.ghostery.com/blog/block-search-engine-ads-on-opera-guide?utm_source=gbe&utm_campaign=opera_serp"
    ></ui-onboarding-serp>
  `,
});
