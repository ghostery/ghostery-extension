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
  href: '',
  render: ({ href }) => html`
    <template layout="block">
      <ui-action>
        <a href="${href}" layout="row items:center padding:0.5">
          <slot></slot>
        </a>
      </ui-action>
    </template>
  `.css`
    @media (hover: hover) {
      :host(:hover) ::slotted(ui-text) {
        text-decoration: underline;
      }

      ::slotted(*:last-child) {
        transition: margin-left 0.1s ease-out;
      }

      :host(:hover) ::slotted(*:last-child) {
        margin-left: 4px;
      }
    }

    ::slotted(ui-text) {
      color: var(--color-primary);
    }
  `,
};
