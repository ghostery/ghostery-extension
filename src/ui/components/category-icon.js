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
import { getCategoryColor } from '../categories.js';

export default {
  name: '',
  render: ({ name }) => html`
    <template layout="row relative size:3 padding:0.5">
      <ui-icon name="category-${name}" layout="grow size:full"></ui-icon>
    </template>
  `.css`
    :host {
      color: ${getCategoryColor(name)};
    }

    :host::before {
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      background: ${getCategoryColor(name)};
      opacity: 0.15;
      border-radius: 4px;
    }
  `,
};
