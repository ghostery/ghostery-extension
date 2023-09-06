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
    <template layout="row padding:2px gap:2px">
      <slot></slot>
    </template>
  `.css`
    :host {
      background: var(--ui-color-gray-100);
      border: 1px solid  var(--ui-color-gray-200);
      border-radius: 8px;
    }
  `,
};
