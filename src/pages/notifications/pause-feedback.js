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

import { setupNotificationPage } from '/utils/notifications.js';

const CLOSE_DELAY = 5 * 1000; // 3 seconds
const close = setupNotificationPage(340);

mount(document.body, {
  answer: {
    value: '',
    observe(host, answer) {
      if (answer) {
        chrome.runtime.sendMessage({
          action: 'config:pause:feedback',
          answer,
        });

        setTimeout(close, CLOSE_DELAY);
      }
    },
  },
  render: ({ answer }) => html`
    <template layout="block overflow relative">
      <ui-notification>
        <ui-text type="label-m">
          To the benefit of the Ghostery community, let us know if this helped!
        </ui-text>
        <div layout="row gap">
          <ui-button type="success" onclick="${html.set('answer', 'yes')}">
            <button>Yes</button>
          </ui-button>
          <ui-button type="secondary" onclick="${html.set('answer', 'no')}">
            <button>No</button>
          </ui-button>
          <ui-button type="secondary" onclick="${() => close()}">
            <button>Skip</button>
          </ui-button>
        </div>
      </ui-notification>
      ${answer &&
      html`
        <ui-card
          narrow
          layout="fixed inset column gap center"
          onclick="${() => close()}"
        >
          <ui-icon name="logo-pause"></ui-icon>
          ${answer === 'yes' &&
          html`<ui-text type="label-m">Fantastic! Thanks!</ui-text>`}
          ${answer === 'no' &&
          html`<ui-text type="label-m">
            We’ll continue working on it! Thanks!
          </ui-text>`}
        </ui-card>
      `}
    </template>
  `,
});
