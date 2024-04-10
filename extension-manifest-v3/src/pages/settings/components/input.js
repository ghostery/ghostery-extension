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
  icon: '',
  render: ({ icon }) => html`
    <template layout="grid relative">
      ${icon &&
      html`
        <div layout="row center absolute inset left:12px right:auto">
          <ui-icon name="${icon}" color="gray-400" layout="size:3"></ui-icon>
        </div>
      `}
      <slot></slot>
    </template>
  `.css`
    :host {
      font: var(--ui-font-body-l);
    }

    ::slotted(input),
    ::slotted(textarea),
    ::slotted(select) {
      background: var(--ui-color-white);
      border: 1px solid var(--ui-color-gray-200);
      border-radius: 8px;
      padding: 11px;
      margin: 0;
      font: var(--ui-font-body-m);
    }

    ::slotted(textarea) {
      padding: 8px;
      font: var(--ui-font-body-s);
    }

    ::slotted(select) {
      appearance: none;
      box-shadow: 0px 2px 6px rgba(32, 44, 68, 0.08);
      font: var(--ui-font-label-m);
      background: no-repeat right 7px center / 16px 16px;
      background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23202C44' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E%0A");
      padding-right: 28px;
    }

    :host([icon]) ::slotted(input) {
      padding-left: 44px;
    }
  `,
};
