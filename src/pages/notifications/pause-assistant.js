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

import Config, { ACTION_PAUSE_ASSISTANT } from '/store/config.js';
import Options from '/store/options.js';

import { setupNotificationPage } from '/utils/notifications.js';

const close = setupNotificationPage(340);
const hostname = new URLSearchParams(window.location.search).get('hostname');

const PAUSE_DELAY = 2000;

async function pause(host) {
  host.pausing = true;

  await store.set(Options, {
    paused: {
      [hostname]: { revokeAt: 0 },
    },
  });

  setTimeout(() => {
    close();

    chrome.runtime.sendMessage({
      action: 'config:pause:reload',
    });
  }, PAUSE_DELAY);
}

async function dismiss() {
  await store.set(Config, {
    domains: {
      [hostname]: { dismiss: [ACTION_PAUSE_ASSISTANT] },
    },
  });

  close();
}

mount(document.body, {
  pausing: false,
  render: ({ pausing }) => html`
    <template layout="block overflow relative">
      <ui-notification>
        <div layout="column gap">
          <ui-text type="label-m">
            Our community reports that Ghostery breaks this site. We recommend
            pausing it temporarily.
          </ui-text>
          <ui-text type="body-s">
            Ads and trackers will not be blocked.
          </ui-text>
        </div>
        <div layout="row gap">
          <ui-button type="success" onclick="${pause}">
            <button>OK</button>
          </ui-button>
          <ui-button type="secondary" onclick="${dismiss}">
            <button>
              <div
                layout="block:left column margin:left:-0.5 margin:right:-0.5"
              >
                <ui-text type="body-s" color="gray-600">
                  Site works fine
                </ui-text>
                <ui-text type="label-m">Dismiss</ui-text>
              </div>
            </button>
          </ui-button>
        </div>
      </ui-notification>
      ${pausing &&
      html`
        <ui-card narrow layout="fixed inset column gap center">
          <ui-icon name="logo-pause"></ui-icon>
          <ui-text type="label-m">Pausing...</ui-text>
        </ui-card>
      `}
    </template>
  `,
});
