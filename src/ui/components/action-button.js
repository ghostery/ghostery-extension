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
      background: var(--background-primary);
      border: 1px solid var(--border-primary);
      box-shadow: 0px 3px 8px var(--shadow-button);
      border-radius: 8px;
      transition: all 0.2s;
      margin: 0;
      color: inherit;
      user-select: none;
    }

    :host([grouped]:not([active])) ::slotted(*) {
      background: none;
      border-color: transparent;
      box-shadow: none;
    }

    @media (hover: hover) {
      ::slotted(*:hover) { border-color: var(--border-secondary); }
    }
  `,
};
