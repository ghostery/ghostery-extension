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
  narrow: { value: false, reflect: true },
  flat: { value: false, reflect: true },
  render: () => html`
    <template layout="column padding:3">
      <slot></slot>
    </template>
  `.css`
    :host {
      background: var(--background-primary);
      border-radius: 8px;
      box-shadow: 0px 4px 12px 0px var(--shadow-card);
    }

    :host([narrow]) {
      border-radius: 8px;
    }

    :host([flat]) {
      box-shadow: none;
      border: 1px solid var(--border-primary);
    }
  `,
};
