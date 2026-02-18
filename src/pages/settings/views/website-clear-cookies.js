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

import { html, msg, router } from 'hybrids';

import WebsiteDetails from './website-details.js';

function clearCookies(host, event) {
  host.error = '';

  router.resolve(
    event,
    chrome.runtime
      .sendMessage({
        action: 'cookies:clean',
        domain: host.domain,
      })
      .then((result) => {
        if (!result.success) {
          host.error = msg`Failed to clear cookies: ${result.error}`;
          throw new Error(host.error);
        }

        return result;
      }),
  );
}

export default {
  [router.connect]: { dialog: true },
  domain: '',
  error: '',
  render: ({ domain, error }) => html`
    <template layout>
      <settings-dialog>
        <div layout="block:center column gap:2">
          <ui-text type="label-l">Clear cookies?</ui-text>
          <ui-text type="body-s" color="tertiary">
            You’re about to remove all cookies stored by ${domain}.
          </ui-text>
          <ui-text type="body-s" color="tertiary">
            This will sign you out and may reset preferences or saved settings. Some pages may not
            work until you sign in or accept cookies again.
          </ui-text>
          ${error && html`<ui-text type="body-s" color="warning-primary"> ${error} </ui-text>`}
        </div>
        <div layout="grid:2 gap margin:top:3">
          <ui-button>
            <a href="${router.backUrl()}">Cancel</a>
          </ui-button>
          <ui-button type="danger" data-qa="button:confirm-clear-cookies">
            <a
              onclick="${clearCookies}"
              href="${router.url(WebsiteDetails, {
                domain,
                clearedCookies: true,
              })}"
            >
              Clear cookies
            </a>
          </ui-button>
        </div>
      </settings-dialog>
    </template>
  `,
};
