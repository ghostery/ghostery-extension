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
    <template layout="relative column">
      <div id="rings">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <slot></slot>
    </template>
  `.css`
    :host {
      /* Matches the radial brand gradient anchored in the top-left corner of the design */
      background: radial-gradient(102% 300% at 0% 0%, #0092c3 0%, #2d3f9b 32%, #320065 100%);
      color: var(--color-onbrand);
      overflow: hidden;

      /* Everything placed on the gradient is rendered on the brand foreground color */
      --color-primary: var(--color-onbrand);
      --color-secondary: var(--color-onbrand);
      --color-tertiary: var(--color-onbrand);
    }

    #rings {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    #rings div {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.025);
    }

    #rings div:nth-child(1) { width: 1246px; height: 1246px; }
    #rings div:nth-child(2) { width: 1038px; height: 1038px; }
    #rings div:nth-child(3) { width: 831px; height: 831px; }
    #rings div:nth-child(4) { width: 623px; height: 623px; }

    ::slotted(*) {
      position: relative;
    }
  `,
};
