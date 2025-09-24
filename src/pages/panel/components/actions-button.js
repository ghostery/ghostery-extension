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
  disabled: { value: false, reflect: true },
  render: ({ disabled }) =>
    html`
      <template layout="grid">
        <ui-button disabled="${disabled}">
          <slot></slot>
        </ui-button>
      </template>
    `.css`
      :host([disabled]) {
        pointer-events: none;
      }

      ui-button {
        height: auto;
        font: var(--font-label-s);
      }

      ui-button ::slotted(*) {
        display: grid;
        justify-items: start;
        align-items: center;
        grid-template-columns: min-content 1fr min-content;
        padding: 4px 8px;
      }
    `,
};
