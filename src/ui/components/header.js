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
    <template
      layout="shrink:0 grid:max|1|max items:center gap:2 height:6 padding:0.5:1.5 relative layer:100"
      layout@390px="height:7 padding:2"
    >
      <div layout="row center width:3">
        <slot name="icon"></slot>
      </div>
      <div><slot></slot></div>
      <div layout="row center width::3 gap">
        <slot name="actions"></slot>
      </div>
    </template>
  `.css`
    :host {
      background: var(--background-primary);
      box-shadow: 0px 4px 16px var(--shadow-card);
    }
   `,
};
