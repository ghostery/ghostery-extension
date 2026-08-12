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
    <template layout="row items:center gap overflow:x:auto">
      <slot></slot>
    </template>
  `.css`
    :host {
      /* The row is full-bleed, but starts where the content of the centered 1200px column does */
      padding-left: max(16px, (100% - 1200px) / 2 + 16px);
      padding-right: max(16px, (100% - 1200px) / 2 + 16px);
      scrollbar-width: none;
    }

    :host::-webkit-scrollbar {
      display: none;
    }
  `,
};
