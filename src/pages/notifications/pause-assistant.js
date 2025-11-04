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

import { dismissAction } from '/store/config.js';

import { ACTION_PAUSE_ASSISTANT } from '/utils/config-types.js';
import { setupNotificationPage } from '/utils/notifications.js';
import { PAUSE_ASSISTANT_LEARN_MORE_URL } from '/utils/urls.js';

const hostname = new URLSearchParams(window.location.search).get('hostname');
const close = setupNotificationPage(390);

async function dismiss() {
  await dismissAction(hostname, ACTION_PAUSE_ASSISTANT);
  close();
}

mount(document.body, {
  render: () => html`
    <template layout="block overflow">
      <ui-notification icon="pause-l">
        <div layout="column gap">
          <ui-text type="label-m">
            Ghostery users report that adblockers break this page. Ghostery has
            been paused.
          </ui-text>
          <ui-text type="body-s">
            Blocking has been paused temporarily, and only on this page.
            Consider pausing other adblockers for best results.
          </ui-text>
          <ui-text type="body-s">
            <a
              href="${PAUSE_ASSISTANT_LEARN_MORE_URL}"
              target="_blank"
              layout="row inline gap:0.5 items:center"
            >
              Learn more
              <ui-icon name="chevron-right-s"></ui-icon>
            </a>
          </ui-text>
        </div>
        <div layout="row gap">
          <ui-button
            type="success"
            size="s"
            onclick="${dismiss}"
            layout="width::10"
          >
            <button>OK</button>
          </ui-button>
        </div>
      </ui-notification>
    </template>
  `,
});
