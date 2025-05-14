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

import { dispatch, html } from 'hybrids';

function onInput(host, event) {
  host.value = event.target.valueAsNumber;

  dispatch(host, 'input', {
    detail: {
      value: event.target.valueAsNumber,
    },
  });
}

export default {
  value: {
    value: 1,
    observe(host, value) {
      const left = host.render().querySelector('#left');
      const right = host.render().querySelector('#right');

      const jumpWidth = (host.clientWidth - 6) / (host.max - 1);
      const leftWidth = Math.max((value - 1) * jumpWidth - 4, 0);
      const rightWidth = Math.max((host.max - value) * jumpWidth - 4, 0);

      left.style.width = `${leftWidth}px`;
      right.style.width = `${rightWidth}px`;
    },
  },
  max: 10,
  render: ({ value, max }) => html`
    <template layout="grid relative height:20px">
      <input
        type="range"
        min="1"
        max="${max}"
        step="1"
        value="${value}"
        oninput="${onInput}"
      />
      <div class="slide" id="left" layout="left:0"></div>
      <div class="slide" id="right" layout="right:0"></div>
    </template>
  `.css`
    input {
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      cursor: pointer;
      margin: 0;
      padding: 0;
      height: 20px;
    }

    input:focus-visible {
      outline: 2px solid var(--border-brand-solid);
      outline-offset: 3px;
    }

    input[type="range"]::-webkit-slider-runnable-track {
      height: 20px;
    }

    input[type="range"]::-moz-range-track {
      height: 20px;
    }

    input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      margin-top: 0px;
      width: 6px;
      height: 20px;
      border-radius: 3px;
      background: var(--background-wtm-solid);
    }

    input::-moz-range-thumb {
      width: 6px;
      height: 20px;
      border: none;
      border-radius: 3px;
      background: var(--background-wtm-solid);
    }

    .slide {
      position: absolute;
      top: 7px;
      height: 6px;
      background: var(--background-wtm-solid);
      border-radius: 3px;
      pointer-events: none;
    }

    .slide#right {
      background: var(--border-secondary);
    }
  `,
};
