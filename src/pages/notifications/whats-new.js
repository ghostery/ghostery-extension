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
      <ui-notification-dialog>
        <span slot="title">What’s New in Ghostery</span>
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
      </ui-notification-dialog>
    </template>
  `,
});
