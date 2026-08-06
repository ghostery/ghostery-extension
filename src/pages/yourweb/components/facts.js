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
    <template layout="column gap padding:0:2" layout@768px="grid:2" layout@1120px="grid:4">
      <slot></slot>
    </template>
  `.css`
    :host {
      position: relative;
    }

    /* The row slides over the header wave, as in the design */
    @media screen and (min-width: 768px) {
      :host {
        margin-top: -96px;
      }
    }
  `,
};
