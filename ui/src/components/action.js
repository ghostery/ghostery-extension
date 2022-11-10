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

import { define, html } from 'hybrids';

export default define({
  tag: 'ui-action',
  render: () => html`
    <template layout="contents">
      <slot></slot>
    </template>
  `.css`
    ::slotted(*) {
      transition: opacity 0.2s, color 0.2s, background-color 0.2s;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    ::slotted(*:active) {
      opacity: 0.6;
    }
  `,
});
