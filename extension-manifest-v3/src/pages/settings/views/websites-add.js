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
      if (options.paused.some((p) => p.id === value)) {
        return;
      }

      return store.set(options, {
        paused: [
          ...options.paused,
          {
            id: value,
            revokeAt: pauseType && Date.now() + 60 * 60 * 1000 * pauseType,
          },
        ],
      });
    }),
  );
}

export default {
  [router.connect]: { dialog: true },
  options: store(Options),
  hostname: store(Hostname, { draft: true }),
  pauseType: 1,
  content: ({ hostname, pauseType }) => html`
    <template layout>
      <gh-settings-dialog>
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
            <gh-settings-input error="${store.error(hostname) || ''}">
              <input
                type="text"
                placeholder="${msg`Enter website URL`}"
                value="${hostname.value}"
                oninput="${html.set(hostname, 'value')}"
                tabindex="1"
              />
            </gh-settings-input>
          </div>
          <div layout="column gap:0.5">
            <ui-text type="label-m">Select time frame</ui-text>
            <gh-settings-input>
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
            </gh-settings-input>
          </div>
          <div layout="grid:1|1 gap margin:top:2">
            <ui-button type="outline" size="small">
              <a href="${router.backUrl()}" tabindex="2">Cancel</a>
            </ui-button>
            <ui-button size="small">
              <button type="submit" tabindex="1">Save</button>
            </ui-button>
          </div>
        </form>
      </gh-settings-dialog>
    </template>
  `,
};
