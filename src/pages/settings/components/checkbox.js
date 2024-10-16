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

import { html } from 'hybrids';

function clickInput(host, event) {
  if (host.input && event.target !== host.input) {
    event.stopPropagation();
    host.input.click();
  }
}

export default {
  disabled: { value: false, reflect: true },
  input: (host) => host.querySelector('input'),
  checked: {
    value: (host, value) => value ?? host.input?.checked,
    connect: (host, key, invalidate) => {
      host.input?.addEventListener('change', invalidate);
      return () => {
        host.input?.removeEventListener('change', invalidate);
      };
    },
  },
  render: () => html`
    <template layout="column">
      <div layout="row items:center" onclick="${clickInput}">
        <slot></slot>
        <ui-text type="body-s" color="gray-600" layout="padding:left:0.5">
          <slot name="label"></slot>
        </ui-text>
      </div>
    </template>
  `.css`
    :host, ::slotted(*) {
      cursor: pointer;
      user-select: none;
    }

    :host([disabled]) {
      pointer-events: none;
    }

    @media (hover: hover) {
      :host(:hover) ui-text {
        color: var(--ui-color-gray-800);
      }
    }
  `,
};
