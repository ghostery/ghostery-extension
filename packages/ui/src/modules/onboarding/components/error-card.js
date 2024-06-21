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
    <template layout="column padding:1.5 gap">
      <slot></slot>
    </template>
  `.css`
    :host {
      border-radius: 8px;
      background: rgba(255, 93, 53, 0.05);
    }
  `,
};
