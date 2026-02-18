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

import { mount, html } from 'hybrids';
import '/ui/index.js';

import * as notifications from '/utils/notifications.js';

const close = notifications.setupNotificationPage(360);

async function enable() {
  try {
    await chrome.runtime.sendMessage({
      action: 'openTabWithUrl',
      url: 'https://www.ghostery.com/blog/block-search-engine-ads-on-opera-guide?utm_source=gbe&utm_campaign=opera_serp',
    });
  } finally {
    close();
  }
}

mount(document.body, {
  render: () => html`
    <template layout="block overflow">
      <ui-notification icon="protection-l" alert>
        <div layout="column gap:1.5">
          <ui-text type="label-l" layout="margin:bottom:-1"> More ad blocking available </ui-text>
          <ui-text type="body-s" color="secondary">
            Expand Ghostery ad blocking to search engines in a few easy steps.
          </ui-text>
          <div layout="row:wrap gap">
            <ui-button type="success" size="s" onclick="${enable}">
              <button>Enable now</button>
            </ui-button>
            <ui-button type="transparent" size="s" onclick="${() => close()}">
              <button>Ignore</button>
            </ui-button>
          </div>
        </div>
      </ui-notification>
    </template>
  `,
});
