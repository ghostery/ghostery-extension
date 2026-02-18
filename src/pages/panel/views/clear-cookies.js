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

import { html, msg, router, store } from 'hybrids';

import TabStats from '/store/tab-stats.js';

import { showAlert } from '../components/alert.js';

async function clearCookies(host) {
  const result = await chrome.runtime.sendMessage({
    action: 'cookies:clean',
    domain: host.stats.domain,
  });

  showAlert(
    html`<panel-alert type="${result.success ? 'success' : 'danger'}" autoclose="2">
      ${result.success ? msg`Cookies successfully cleared` : msg`Failed to clear cookies`}
    </panel-alert>`,
  );
}

export default {
  [router.connect]: { dialog: true },
  stats: store(TabStats),
  render: ({ stats }) => html`
    <template layout="column">
      <panel-dialog>
        <div layout="block:center column gap:2 padding:2:0">
          <ui-text type="label-l">Clear cookies?</ui-text>
          <ui-text type="body-s" color="tertiary">
            You’re about to remove all cookies stored by ${stats.domain}.
          </ui-text>
          <ui-text type="body-s" color="tertiary">
            This will sign you out and may reset preferences or saved settings. Some pages may not
            work until you sign in or accept cookies again.
          </ui-text>
        </div>
        <div layout="grid:2 gap">
          <ui-button>
            <a href="${router.backUrl()}">Cancel</a>
          </ui-button>
          <ui-button type="danger" data-qa="button:confirm-clear-cookies">
            <a onclick="${clearCookies}" href="${router.backUrl()}"> Clear cookies </a>
          </ui-button>
        </div>
      </panel-dialog>
    </template>
  `,
};
