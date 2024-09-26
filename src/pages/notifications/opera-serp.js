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

import '/ui/index.js';

import * as notifications from '/utils/notifications.js';
import Options from '/store/options.js';

const close = notifications.setupNotificationPage(360);

async function updateOptions() {
  const options = await store.resolve(Options);

  return store.set(options, {
    onboarding: {
      serpShown: options.onboarding.serpShown + 1,
      serpShownAt: Date.now(),
    },
  });
}

async function enable() {
  try {
    await chrome.runtime.sendMessage({
      action: 'openTabWithUrl',
      url: 'https://www.ghostery.com/blog/block-search-engine-ads-on-opera-guide?utm_source=gbe&utm_campaign=opera_serp',
    });

    await updateOptions();
  } finally {
    close();
  }
}

async function ignore() {
  try {
    await updateOptions();
  } finally {
    close();
  }
}

mount(document.body, {
  render: () => html`
    <template layout="block overflow">
      <ui-card layout="padding:2">
        <div layout="row items:start gap:2">
          <div layout="relative">
            <ui-icon name="ghosty" color="gray-300" layout="size:4"></ui-icon>
            <ui-icon
              name="alert"
              color="danger-500"
              layout="absolute bottom:-1 right:-1"
            ></ui-icon>
          </div>
          <div layout="column gap:1.5">
            <ui-text type="label-l" layout="margin:bottom:-1">
              More ad blocking available
            </ui-text>
            <ui-text type="body-s" color="gray-600">
              Expand Ghostery ad blocking to search engines in a few easy steps.
            </ui-text>
            <div layout="row:wrap gap">
              <ui-button type="success">
                <button onclick="${enable}">Enable now</button>
              </ui-button>
              <ui-button type="transparent">
                <button onclick="${ignore}">Ignore</button>
              </ui-button>
            </div>
          </div>
        </div>
      </ui-card>
    </template>
  `,
});
