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
      layout="column top items:center fixed inset padding:4:2.5:2.5 layer:1000"
      layout@768px="padding:15vh:5:5"
    >
      <div
        id="dialog"
        layout="column shrink:0 relative width:full::600px height:::full"
      >
        <div
          layout="column gap:2 overflow:y:auto basis:full padding:2.5 padding:bottom:12"
          layout@768px="padding:4:4:12"
        >
          <header layout="block:center"><slot name="header"></slot></header>
          <slot></slot>
        </div>
        <footer
          layout="row gap:2 absolute inset top:auto layer padding:0:2.5:2.5"
          layout@390px="content:flex-end"
          layout@768px="padding:0:4:4"
        >
          <slot
            name="footer"
            layout::slotted(*)="relative grow:1 layer:2"
            layout::slotted(*)@390px="grow:0"
          ></slot>
        </footer>
      </div>
    </template>
  `.css`
    :host {
      background: rgba(18, 18, 28, 0.4);
      backdrop-filter: blur(4px);
    }

    #dialog {
      background: var(--ui-color-layout);
      border-radius: 16px;
      box-shadow: 30px 60px 160px rgba(0, 0, 0, 0.2);
    }

    footer::before {
      z-index: 0;
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      border-radius: 16px;
      background: linear-gradient(0deg, var(--ui-color-layout) 0%, rgba(47, 49, 54, 0) 100%);
    }
  `,
};
