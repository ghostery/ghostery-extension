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

import badge from '../assets/yourweb-badge.svg';
import wave from '../assets/yourweb-wave.svg';

export default {
  render: () => html`
    <template layout="column shrink:0 relative overflow">
      <div id="rings">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div layout="relative column center gap:2 padding:4:2">
        <img src="${badge}" alt="" layout="size:6" />
        <ui-text type="headline-s" color="onbrand" uppercase layout="block:center">
          <slot></slot>
        </ui-text>
      </div>
      <div id="wave" layout="relative shrink:0 height:6"></div>
    </template>
  `.css`
    :host {
      /* Matches the radial brand gradient anchored in the top-left corner of the design */
      background: radial-gradient(112% 246% at 0% 0%, #0092c3 0%, #2d3f9b 32%, #320065 100%);
    }

    #rings {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    /* The rings are centered horizontally, but their center sits above the header */
    #rings div {
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.025);
    }

    #rings div:nth-child(1) { width: 688px; height: 688px; }
    #rings div:nth-child(2) { width: 573px; height: 573px; }
    #rings div:nth-child(3) { width: 459px; height: 459px; }
    #rings div:nth-child(4) { width: 344px; height: 344px; }

    #wave {
      background: var(--background-primary);
      mask: url("${wave}") no-repeat center bottom / auto 100%;
    }
  `,
};
