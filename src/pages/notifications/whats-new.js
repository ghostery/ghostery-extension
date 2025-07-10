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
import { WHATS_NEW_PAGE_URL } from '/utils/urls.js';

import whatsNewImage from './assets/whats-new.png';

const close = notifications.setupNotificationPage(390);

mount(document.body, {
  render: () => html`
    <template layout="block overflow">
      <ui-card narrow layout="relative padding:0">
        <header layout="grid:32px|1|32px gap padding:0.5:1 items:center">
          <ui-icon name="logo" layout="size:2.5"></ui-icon>
          <ui-text type="label-m">What’s New in Ghostery</ui-text>
          <ui-button onclick="${close}" type="transparent" size="s">
            <button>
              <ui-icon
                name="close"
                color="quaternary"
                layout="size:2.5"
              ></ui-icon>
            </button>
          </ui-button>
        </header>
        <ui-line></ui-line>
        <div layout="column gap:1.5 padding:2:1.5">
          <img
            src="${whatsNewImage}"
            alt="What's New"
            style="border-radius:8px"
          />
          <ui-text layout="block:center" color="secondary">
            Discover fresh features, key improvements, and upgrades driven by
            community contributions - all in one place.
          </ui-text>
          <ui-button type="wtm" layout="self:center">
            <a href="${WHATS_NEW_PAGE_URL}" target="_blank" onclick="${close}">
              See What's New
            </a>
          </ui-button>
        </div>
      </ui-card>
    </template>
  `,
});
