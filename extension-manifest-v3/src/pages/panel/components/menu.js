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
    <template layout="column gap padding:bottom">
      <div id="header"><slot name="header"></slot></div>
      <slot></slot>
    </template>
  `.css`
    :host {
      background: var(--ui-color-white);
    }

    #header {
    }

    ::slotted(a) {
      text-decoration: none;
    }

    ::slotted(hr) {
      height: 1px;
      margin: 0;
      border: none;
      background: var(--ui-color-gray-200);
    }
  `,
};
