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

import { define, html } from 'hybrids';

function setupChecked(host) {
  const input = host.querySelector('input');
  host.checked = input?.checked;
}

function updateChecked(host, event) {
  host.checked = event.target.checked;
}

export default define({
  tag: 'ui-onboarding-toggle',
  checked: true,
  render: () => html`
    <div onchange=${updateChecked}>
      <slot onslotchange="${setupChecked}"></slot>
    </div>
  `.css`
    :host {
      position: relative;
      box-sizing: border-box;
      width: 80px;
      height: 44px;
      background: var(--ui-color-error-400);
      border-radius: 22px;
      transition: all 0.2s ease-in-out;
    }

    ::slotted(*) {
      position: absolute;
      left: 2px;
      top: 2px;
      width: 40px;
      height: 40px;
      appearance: none;
      display: block;
      background: var(--ui-color-white);
      box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.6);
      border-radius: 20px;
      margin: 0;
      padding: 0;
      transition: all 0.2s ease-in-out;
    }

    :host([checked]) {
      background: #43AC3C;
      box-shadow: inset 0px 0px 0px 1px rgba(255, 255, 255, 0.2), inset 4px 4px 8px rgba(0, 0, 0, 0.15);
    }

    :host([checked]) ::slotted(*) {
      left: calc(100% - 42px);
    }
  `,
});
