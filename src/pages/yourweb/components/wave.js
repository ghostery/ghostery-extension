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

import assets from '../assets/index.js';

export default {
  flip: { value: false, reflect: true },
  render: () => html`
    <template layout="block shrink:0 height:6 margin:-1px:0" layout@768px="height:12"></template>
  `.css`
    :host {
      background: var(--background-primary);
      mask: url("${assets.wave}") no-repeat 0 bottom / 100% auto;
    }

    :host([flip]) {
      transform: scaleY(-1);
    }
  `,
};
