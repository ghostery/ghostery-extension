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

import { setupIframeSize, closeIframe } from '@ghostery/ui/iframe';

import TabStats from '/store/tab-stats.js';
import Options from '/store/options.js';

setupIframeSize();

async function close(host, event) {
  await store.set(Options, {
    onboarding: event.type === 'ignore' ? { shownAt: Date.now() } : null,
  });

  // Options notify other contexts about changes, but
  // we cannot await for it, as Safari returns unfulfilled promise
  // which introduces bug
  setTimeout(closeIframe, 100);
}

mount(document.body, {
  stats: store(TabStats),
  content: ({ stats }) => html`
    <ui-onboarding-iframe
      trackers="${store.ready(stats) ? stats.trackers.length : 0}"
      onignore="${close}"
      onenable="${close}"
    ></ui-onboarding-iframe>
  `,
});
