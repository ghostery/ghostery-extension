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
import '@ghostery/ui/autoconsent';
import { setupIframeSize, closeIframe } from '@ghostery/ui/iframe';

import Options from '/store/options.js';
import TabStats from '/store/tab-stats.js';

const hostname = new URLSearchParams(window.location.search).get('host');

setupIframeSize();

async function enable(_, event) {
  const options = await store.resolve(Options);
  const { all } = event.detail;

  let { allowed, disallowed, interactions } = options.autoconsent;

  if (all) {
    allowed = [];
    disallowed = [];
  } else {
    interactions += 1;
    allowed = allowed.includes(hostname) ? allowed : allowed.concat(hostname);
    disallowed = disallowed.filter((h) => h !== hostname);
  }

  store.set(options, {
    engines: { annoyances: true },
    autoconsent: {
      all,
      allowed,
      disallowed,
      interactions,
    },
  });
}

function close(host, event) {
  closeIframe(event.detail.reload);
}

async function disable(_, event) {
  const options = await store.resolve(Options);
  const { all } = event.detail;

  let { disallowed, allowed, interactions } = options.autoconsent;

  if (all) {
    disallowed = [];
    allowed = [];
    interactions = 0;
  } else {
    interactions += 1;
    disallowed = disallowed.includes(hostname)
      ? disallowed
      : disallowed.concat(hostname);
  }

  store.set(Options, {
    engines: { annoyances: !all },
    autoconsent: { allowed, disallowed, interactions },
  });
}

define({
  tag: 'gh-autoconsent',
  stats: store(TabStats),
  content: ({ stats }) =>
    html`
      <template layout="block">
        <ui-autoconsent
          categories="${store.ready(stats) && stats.categories}"
          onenable="${enable}"
          ondisable="${disable}"
          onclose="${close}"
        ></ui-autoconsent>
      </template>
    `,
});
