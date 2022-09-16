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

import { define, html, store } from 'hybrids';

import Options from '/store/options.js';
import { statsFactory } from '/store/stats.js';

const hostname = new URLSearchParams(window.location.search).get('host');

async function enable(_, event) {
  const options = await store.resolve(Options);
  const { all } = event.detail;

  let { allowed, disallowed } = options.autoconsent;

  if (all) {
    allowed = [];
    disallowed = [];
  } else {
    allowed = allowed.includes(hostname) ? allowed : allowed.concat(hostname);
  }

  store.set(options, {
    autoconsent: {
      all,
      allowed,
      disallowed,
    },
  });
}

async function disable(_, event) {
  const options = await store.resolve(Options);
  const { all } = event.detail;

  let { disallowed, allowed } = options.autoconsent;

  if (all) {
    disallowed = [];
    allowed = [];
  } else {
    disallowed = disallowed.includes(hostname)
      ? disallowed
      : disallowed.concat(hostname);
  }

  store.set(Options, {
    dnrRules: { annoyances: !all },
    autoconsent: { allowed, disallowed },
  });
}

export default define({
  tag: 'gh-autoconsent',
  stats: statsFactory(),
  content: ({ stats }) =>
    html`
      <template layout="block">
        <ui-autoconsent
          categories="${store.ready(stats) && stats.categories}"
          onenable=${enable}
          ondisable=${disable}
        ></ui-autoconsent>
      </template>
    `,
});
