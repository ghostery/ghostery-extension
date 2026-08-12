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
    <template layout="block">
      <slot></slot>
    </template>
  `.css`
    :host {
      background: linear-gradient(
        180deg,
        var(--background-secondary) 0%,
        var(--background-primary) 100%
      );
    }

    /* The illustration keeps the page gutter, so it cannot use padding with the radius */
    ::slotted(img) {
      align-self: center;
      width: calc(100% - 32px);
      max-width: 940px;
      border-radius: 24px;
    }
  `,
};
