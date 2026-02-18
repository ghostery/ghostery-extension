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
import { REVIEW_STORE_PAGE_URL } from '/utils/urls.js';

const close = notifications.setupNotificationPage(390);

mount(document.body, {
  render: () => html`
    <template layout="block overflow">
      <ui-notification-dialog onclose="${close}">
        <span slot="title">A Quick Review Goes a Long Way</span>
        <ui-text layout="block:center" color="secondary">
          If Ghostery makes your browsing better, a short review helps more people discover a
          calmer, ad-free web.
        </ui-text>
        <ui-button type="wtm" layout="self:center">
          <a href="${REVIEW_STORE_PAGE_URL}" target="_blank" onclick="${close}"> Share a Review </a>
        </ui-button>
      </ui-notification-dialog>
    </template>
  `,
});
