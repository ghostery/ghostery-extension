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

import { define, html, router, dispatch } from 'hybrids';

import Confirm from './confirm.js';

const defaultChoice = new URLSearchParams(window.location.search).get(
  'default',
);

function onConfirm(type) {
  return (host) => {
    dispatch(host, type, {
      bubbles: true,
      detail: { all: host.scope === 'all' },
    });
  };
}

export default define({
  [router.connect]: { stack: [Confirm] },
  tag: 'ui-autoconsent-home-view',
  scope: defaultChoice === 'all' ? 'all' : 'selected',
  content: ({ scope }) => html`
    <template layout="column margin:3 gap:4">
      <div layout="column items:center gap">
        <ui-text type="display-s" layout="block:center">
          TIRED OF COOKIE POPUPS?
        </ui-text>
        <ui-text layout="block:center">
          Let Ghostery be your complete privacy advocate and reject all popups
          and tracking for you, or do it yourself!
        </ui-text>
      </div>
      <div layout="column items:center gap">
        <ui-text type="display-2xs"> Enable Never-Consent? </ui-text>
        <ui-text>Apply optimal privacy settings:</ui-text>
        <div layout="column gap:0.5">
          <label layout="row items:center gap">
            <input
              type="radio"
              name="scope"
              value="selected"
              onchange="${html.set('scope')}"
              checked="${scope === 'selected'}"
              layout="margin:0"
              style="accent-color: var(--ui-color-primary-700)"
            />
            <ui-text>on this website</ui-text>
          </label>
          <label layout="row items:center gap">
            <input
              type="radio"
              name="scope"
              value="all"
              onchange="${html.set('scope')}"
              checked="${scope === 'all'}"
              layout="margin:0"
              style="accent-color: var(--ui-color-primary-700)"
            />
            <ui-text><strong>on all websites</strong></ui-text>
          </label>
        </div>
      </div>
      <div layout="grid:2 gap:2">
        <ui-button type="outline" size="small">
          <a
            href="${router.url(Confirm, { enabled: false })}"
            onclick="${onConfirm('disable')}"
          >
            No
          </a>
        </ui-button>
        <ui-button type="primary" size="small">
          <a
            href="${router.url(Confirm, { enabled: true })}"
            onclick="${onConfirm('enable')}"
          >
            Yes
          </a>
        </ui-button>
      </div>
    </template>
  `,
});
