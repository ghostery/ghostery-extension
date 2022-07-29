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

import { html, define } from 'hybrids';

import { drawWheel } from '../utils/wheel.js';

export default define({
  tag: 'ui-tracker-wheel',
  categories: undefined,
  size: 150,
  canvas: ({ categories, size }) => {
    if (!categories) return null;

    const el = document.createElement('canvas');

    const context = el.getContext('2d');
    context.imageSmoothingQuality = 'high';

    drawWheel(
      context,
      size,
      categories.length === 0 ? ['unknown'] : categories,
    );

    // return element
    return el;
  },
  render: ({ categories, canvas, size }) => html`
    ${canvas}
    <strong>${categories && categories.length}</strong>
  `.css`
     :host {
       align-self: center;
       position: relative;
       display: flex;
       width: ${size}px;
       height: ${size}px;
       flex-shrink: 0;
       justify-content: center;
       align-items: center;
     }
 
     canvas {
       position: absolute;
       top: 0px;
       left: 0px;
 
       /* all four are needed to support the most browsers */
       image-rendering: -moz-crisp-edges;
       image-rendering: -webkit-crisp-edges;
       image-rendering: pixelated;
       image-rendering: crisp-edges;
     }
 
     strong {
       color: var(--ui-black);
       font-weight: 500;
       font-size: 40px;
     }
   `,
});
