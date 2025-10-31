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
import Tracker from '/store/tracker.js';

import * as exceptions from '/utils/exceptions.js';

import Hostname from '../store/hostname.js';

async function add({ options, tracker, hostname }, event) {
  event.preventDefault();

  router.resolve(
    event,
    store
      .submit(hostname)
      .then(({ value }) =>
        exceptions.toggleDomain(options, tracker.id, value, true),
      ),
  );
}

export default {
  [router.connect]: { dialog: true },
  options: store(Options),
  tracker: store(Tracker),
  hostname: store(Hostname, { draft: true }),
  render: ({ tracker, hostname }) => html`
    <template layout>
      ${store.ready(tracker) &&
      html`
        <settings-dialog closable>
          <form
            action="${router.backUrl()}"
            onsubmit="${add}"
            layout="column gap:3"
          >
            <ui-text type="label-l" layout="block:center margin:bottom">
              Add website exception
            </ui-text>
            <div layout="column gap:2">
              <div layout="column gap:0.5">
                <ui-text type="label-m">Website</ui-text>
                <ui-input error="${store.error(hostname) || ''}">
                  <input
                    type="text"
                    placeholder="${msg`Enter website URL`}"
                    value="${hostname.value}"
                    oninput="${html.set(hostname, 'value')}"
                    tabindex="1"
                  />
                </ui-input>
              </div>
              <ui-text type="body-s" color="secondary">
                ${tracker.name} will be trusted on this website.
              </ui-text>
            </div>
            <div layout="grid:1|1 gap margin:top:2">
              <ui-button>
                <a href="${router.backUrl()}" tabindex="2">Cancel</a>
              </ui-button>
              <ui-button type="primary">
                <button type="submit" tabindex="1">Save</button>
              </ui-button>
            </div>
          </form>
        </settings-dialog>
      `}
    </template>
  `,
};
