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
  render: () => html`
    <template layout="column gap">
      <header layout="padding:1.5" layout@768px="padding:1.5:2">
        <slot name="header"></slot>
      </header>
      <div layout="column gap"><slot></slot></div>
    </template>
  `.css`
    header {
      background: var(--ui-color-gray-100);
      border-radius: 8px;
    }

    div ::slotted(*) {
      padding: 12px 14px;
      border: 1px solid var(--ui-color-gray-200);
      border-radius: 8px;
    }

    @media screen and (min-width: 768px) {
      div ::slotted(*) {
        padding: 24px 16px;
        border-radius: 0;
        border: none;
        border-bottom: 1px solid var(--ui-color-gray-200);
      }
    }
  `,
};
