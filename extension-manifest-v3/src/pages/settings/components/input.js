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

    ::slotted(input) {
      background: var(--ui-color-white);
      border: 1px solid var(--ui-color-gray-200);
      border-radius: 8px;
      padding: 11px;
      margin: 0;
      font: var(--ui-font-body-m);
    }

    ::slotted(textarea) {
      background: var(--ui-color-white);
      border: 1px solid var(--ui-color-gray-200);
      border-radius: 8px;
      padding: 8px;
      margin: 0;
      font: var(--ui-font-body-s);
    }

    :host([icon]) ::slotted(input) {
      padding-left: 44px;
    }
  `,
};
