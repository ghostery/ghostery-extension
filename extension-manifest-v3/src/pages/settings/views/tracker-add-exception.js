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

import { parse } from 'tldts-experimental';

const Hostname = {
  id: true,
  value: '',
  [store.connect]: {
    get: () => null,
    set: (id, model) => {
      const parsed = parse(model.value);
      if (!parsed.hostname && !parsed.isIp) {
        throw 'The value must be a valid hostname or IP address.';
      }
      return {
        ...model,
        value: parsed.hostname.replace(/^www\./, ''),
      };
    },
  },
};

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
  content: ({ tracker, blocked, hostname }) => html`
    <template layout>
      ${store.ready(tracker) &&
      html`
        <gh-settings-dialog>
          <form
            action="${router.backUrl()}"
            onsubmit="${add}"
            layout="column gap:4"
          >
            <ui-text type="label-l">Add website exception</ui-text>
            <div layout="column gap items:start">
              <ui-text>
                <!-- Current protection status for a tracker -->
                Current protection status for ${tracker.name}:
              </ui-text>
              <gh-settings-protection-badge
                blocked="${blocked}"
              ></gh-settings-protection-badge>
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
              <ui-text type="body-s" color="gray-600">
                ${blocked
                  ? msg`${tracker.name} will be trusted on this website. | A tracker will be trusted on this website.`
                  : msg`${tracker.name} will be blocked on this website. | A tracker will be trusted on this website.`}
              </ui-text>
            </div>
            <div layout="grid:1|1 gap">
              <ui-button type="outline" size="small">
                <a href="${router.backUrl()}" tabindex="2">Cancel</a>
              </ui-button>
              <ui-button size="small">
                <button type="submit" tabindex="1">Save</button>
              </ui-button>
            </div>
          </form>
        </gh-settings-dialog>
      `}
    </template>
  `,
};
