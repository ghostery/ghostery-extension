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
    <template layout="column overflow">
      <header><slot name="header"></slot></header>
      <div><slot></slot></div>
    </template>
  `.css`
    :host {
      border-radius: 8px;
      border: 1px solid var(--ui-color-gray-200);
    }
  
    header {
      background: var(--ui-color-gray-100);
      border-bottom: 1px solid var(--ui-color-gray-200);
    }

    div ::slotted(*) {
      padding-bottom: 12px;
      border-bottom: 1px solid var(--ui-color-gray-200);
    }

    div ::slotted(*:last-child) {
      padding-bottom: 0;
      border-bottom: none;
    }
  `,
};
