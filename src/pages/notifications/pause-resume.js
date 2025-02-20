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

import Options from '/store/options.js';

import { setupNotificationPage } from '/utils/notifications.js';

const close = setupNotificationPage(360);
const hostname = new URLSearchParams(window.location.search).get('hostname');

const PAUSE_DELAY = 2000;
const FEEDBACK_DELAY = 2000;

async function revoke(host) {
  host.resuming = true;

  await store.set(Options, { paused: { [hostname]: null } });

  setTimeout(() => {
    close();
    chrome.runtime.sendMessage({
      action: 'config:pause:reload',
      params: { type: 'resume' },
      delay: FEEDBACK_DELAY,
    });
  }, PAUSE_DELAY);
}

async function dismiss() {
  await store.set(Options, { paused: { [hostname]: { assist: false } } });
  close();
}

mount(document.body, {
  resuming: false,
  render: ({ resuming }) => html`
    <template layout="block overflow relative">
      <ui-notification>
        <div layout="column gap">
          <ui-text type="label-m">
            Ghostery users report that ad blockers are no longer breaking this
            site. Resume Ghostery.
          </ui-text>
        </div>
        <div layout="row gap">
          <ui-button type="success" onclick="${revoke}">
            <button>OK</button>
          </ui-button>
          <ui-button type="secondary" onclick="${dismiss}">
            <button>Dismiss</button>
          </ui-button>
        </div>
      </ui-notification>
      ${resuming &&
      html`
        <ui-card narrow layout="fixed inset column gap center">
          <ui-icon name="logo"></ui-icon>
          <ui-text type="label-m">Resuming...</ui-text>
        </ui-card>
      `}
    </template>
  `,
});
