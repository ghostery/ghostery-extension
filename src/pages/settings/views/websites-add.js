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

async function add({ options, hostname, pauseType }, event) {
  event.preventDefault();

  router.resolve(
    event,
    store.submit(hostname).then(({ value }) => {
      if (options.paused[value]) return;

      return store.set(options, {
        paused: {
          [value]: {
            revokeAt: pauseType && Date.now() + 60 * 60 * 1000 * pauseType,
          },
        },
      });
    }),
  );
}

export default {
  [router.connect]: { dialog: true },
  options: store(Options),
  hostname: store(Hostname, { draft: true }),
  pauseType: 1,
  render: ({ hostname, pauseType }) => html`
    <template layout>
      <settings-dialog>
        <form
          action="${router.backUrl()}"
          onsubmit="${add}"
          layout="column gap:3"
        >
          <ui-text type="label-l" layout="block:center margin:bottom">
            Add website
          </ui-text>
          <div layout="column gap items:start">
            <ui-text>To adjust privacy protection trust a site:</ui-text>
          </div>
          <div layout="column gap:0.5">
            <ui-text type="label-m">Website</ui-text>
            <settings-input error="${store.error(hostname) || ''}">
              <input
                type="text"
                placeholder="${msg`Enter website URL`}"
                value="${hostname.value}"
                oninput="${html.set(hostname, 'value')}"
                tabindex="1"
              />
            </settings-input>
          </div>
          <div layout="column gap:0.5">
            <ui-text type="label-m">Select time frame</ui-text>
            <settings-input>
              <select
                type="text"
                placeholder="${msg`Enter website URL`}"
                value="${pauseType}"
                oninput="${html.set('pauseType')}"
                tabindex="2"
              >
                <option value="1">1 hour</option>
                <option value="24">1 day</option>
                <option value="0">Always</option>
              </select>
            </settings-input>
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
    </template>
  `,
};
