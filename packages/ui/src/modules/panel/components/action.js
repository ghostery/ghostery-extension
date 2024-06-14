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

export default {
  active: { value: false, reflect: true },
  grouped: { value: false, reflect: true },
  disabled: { value: false, reflect: true },
  render: () => html`
    <template layout="grid height:4.5">
      <ui-action><slot></slot></ui-action>
    </template>
  `.css`
    ::slotted(*) {
      cursor: pointer;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      appearance: none;
      border: none;
      background: var(--ui-color-white);
      border: 1px solid var(--ui-color-gray-200);
      box-shadow: 0px 2px 6px rgba(32, 44, 68, 0.08);
      border-radius: 8px;
      transition: all 0.2s;
      margin: 0;
      color: inherit;
    }

    :host([grouped]:not([active])) ::slotted(*) {
      background: none;
      border-color: transparent;
      box-shadow: none;
    }

    :host([disabled]) ::slotted(*) {
      pointer-events: none;
      cursor: default;
      box-shadow: none;
      background: var(--ui-color-gray-100);
      color: var(--ui-color-gray-600);
      --ui-text-color-heading: var(--ui-color-gray-600);
    }

    @media (hover: hover) and (pointer: fine) {
      ::slotted(*:hover) { border-color: var(--ui-color-gray-300);} }
    }
  `,
};
