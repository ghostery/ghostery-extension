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
import Tracker from '/store/tracker.js';

import { toggleExceptionDomain } from '/store/tracker-exception.js';
import Hostname from '../store/hostname.js';

async function add({ tracker, hostname }, event) {
  event.preventDefault();

  router.resolve(
    event,
    store.submit(hostname).then(({ value }) => {
      return toggleExceptionDomain(
        tracker.exception,
        value,
        tracker.blockedByDefault,
        true,
      );
    }),
  );
}

export default {
  [router.connect]: { dialog: true },
  tracker: store(Tracker),
  blocked: ({ tracker }) =>
    store.ready(tracker.exception)
      ? tracker.exception.blocked
      : tracker.blockedByDefault,
  hostname: store(Hostname, { draft: true }),
  render: ({ tracker, blocked, hostname }) => html`
    <template layout>
      ${store.ready(tracker) &&
      html`
        <settings-dialog>
          <form
            action="${router.backUrl()}"
            onsubmit="${add}"
            layout="column gap:3"
          >
            <ui-text type="label-l" layout="block:center margin:bottom">
              Add website exception
            </ui-text>
            <ui-text layout="row:wrap gap:0.5 items:center">
              <!-- Current protection status for a tracker -->
              Current protection status for ${tracker.name}:
              <settings-protection-badge
                blocked="${blocked}"
              ></settings-protection-badge>
            </ui-text>
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
              <ui-text type="body-s" color="gray-600">
                ${blocked
                  ? msg`${tracker.name} will be trusted on this website. | A tracker will be trusted on this website.`
                  : msg`${tracker.name} will be blocked on this website. | A tracker will be trusted on this website.`}
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
