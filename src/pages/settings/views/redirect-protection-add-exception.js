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

import { html, router, store, msg } from 'hybrids';

import Options from '/store/options.js';
import Hostname from '../store/hostname.js';

async function add({ options, hostname }, event) {
  event.preventDefault();

  router.resolve(
    event,
    store.submit(hostname).then(({ value }) => {
      if (options.redirectProtection.exceptions[value]) {
        return;
      }

      return store.set(options, {
        redirectProtection: { exceptions: { [value]: true } },
      });
    }),
  );
}

export default {
  [router.connect]: { dialog: true },
  options: store(Options),
  hostname: store(Hostname, { draft: true }),
  render: ({ hostname }) => html`
    <template layout>
      <settings-dialog closable>
        <form
          action="${router.backUrl()}"
          onsubmit="${add}"
          layout="column gap:3"
        >
          <ui-text type="label-l" layout="block:center margin:bottom">
            Add redirect exception
          </ui-text>
          <div layout="column gap items:start">
            <ui-text type="body-m" color="secondary">
              Enter the website URL you want to allow redirects from. Ghostery
              will not show the warning page for this domain.
            </ui-text>
          </div>
          <div layout="column gap:0.5">
            <ui-text type="label-m">Website</ui-text>
            <ui-input error="${store.error(hostname) || ''}">
              <input
                type="text"
                placeholder="${msg`Enter website URL`}"
                value="${hostname.value}"
                oninput="${html.set(hostname, 'value')}"
                tabindex="1"
                data-qa="input:redirect-protection:hostname"
              />
            </ui-input>
          </div>
          <div layout="grid:1|1 gap margin:top:2">
            <ui-button>
              <a href="${router.backUrl()}" tabindex="2">Cancel</a>
            </ui-button>
            <ui-button type="primary" data-qa="button:redirect-protection:save">
              <button type="submit" tabindex="1">Save</button>
            </ui-button>
          </div>
        </form>
      </settings-dialog>
    </template>
  `,
};
