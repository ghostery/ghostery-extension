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
  type: { value: '', reflect: true },
  render: () => html`
    <template layout="block padding:1.5">
      <slot></slot>
    </template>
  `.css`
    :host {
      background: var(--background-secondary);
      border-radius: 8px;
    }

    :host([type="info"]) {
      background: var(--background-brand-primary);
    }
  `,
};
