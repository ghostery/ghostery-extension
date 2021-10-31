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

import { html, define, store, dispatch } from '/hybrids.js';

const SIZE = 150;

define({
  tag: "tracker-wheel",
  stats: null,
  canvas: ({ stats }) => {
    const el = document.createElement("canvas");
    el.setAttribute('height', SIZE);
    el.setAttribute('width', SIZE);

    const context = el.getContext('2d');
    context.imageSmoothingQuality = 'high';

    const categories = store.ready(stats)
      ? stats.trackers.length > 0
        ? stats.trackers.map(t => t.category)
        : ['unknown']
      : ['unknown'];
    draw(context, categories);

    // return element
    return el;
  },
  render: ({ stats, canvas }) => html`
    ${canvas}
    <strong>${store.ready(stats) ? stats.trackers.length : 0}</strong>
  `.css`
    :host {
      position: relative;
      display: flex;
      width: ${SIZE}px;
      height: ${SIZE}px;
      flex-shrink: 0;
      justify-content: center;
      align-items: center;
    }

    canvas {
      position: absolute;
      top: 0px;
      left: 0px;
    }

    strong {
      color: var(--black);
      font-weight: 500;
      font-size: 40px;
    }
  `,
});
