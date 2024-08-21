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

import { html, svg } from 'hybrids';
import {
  getCategoryBgColor,
  getCategoryKey,
} from '../../../utils/categories.js';
import * as labels from '../../../utils/labels.js';

function updateTooltipPosition(host, event) {
  const { clientX, clientY } = event;
  const { left, top } = host.getBoundingClientRect();

  const x = clientX - left;
  const y = clientY - top;

  host.tooltip.style.left = `${x}px`;
  host.tooltip.style.top = `${y}px`;
}

function count(key) {
  return (acc, current) => (current === key ? acc + 1 : acc);
}

export default {
  categories: undefined,
  data: ({ categories = [] }) => {
    if (!categories.length) {
      return [['', { value: 100, offset: 0 }]];
    }

    const data = categories.reduce((map, key) => {
      const value = map.get(key) || 0;
      map.set(key, value + 1);
      return map;
    }, new Map());
    let length = categories.length;
    const borderLength = 4;

    const underLimit = [];
    data.forEach((value, key) => {
      if (value / length <= borderLength / 100) {
        underLimit.push(key);
      }
    });

    const minValue = length / (100 / borderLength - underLimit.length);
    underLimit.forEach((key) => {
      const value = data.get(key);
      data.set(key, minValue);
      length += minValue - value;
    });

    let offset = 0;
    data.forEach((value, key) => {
      value = Math.max((value / length) * 100 - borderLength, 0);

      data.set(key, {
        value,
        offset,
      });

      offset += ((value + borderLength) * 360) / 100;
    });

    return [...data.entries()];
  },
  current: '',
  tooltip: ({ render }) => render().querySelector('ui-tooltip'),
  render: ({ categories, data, current }) => html`
    <template layout="grid relative">
      <ui-tooltip
        layout="block absolute top left padding:top:0.5"
        show="${current}"
        delay="0"
      >
        <span slot="content"
          >${labels.categories[getCategoryKey(current)]}:
          ${categories.reduce(count(current), 0)}</span
        >
      </ui-tooltip>
      <svg viewBox="0 0 36 36" onmousemove="${updateTooltipPosition}">
        ${data.map(
          ([key, { value, offset }]) =>
            svg`
              <path
                class="${{ empty: !key }}"
                stroke-dasharray="${value}, ${100 - value}"
                transform="rotate(${offset}, 18, 18)"
                stroke="${getCategoryBgColor(key)}"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                onmouseenter="${html.set('current', key)}"
                onmouseleave="${html.set('current', '')}"
              />
          `,
        )}
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle">
          ${categories && categories.length}
        </text>
      </svg>
    </template>
  `.css`
    path {
      fill: none;
      stroke-width: 3;
      stroke-linecap: round;
      transition: all 0.5s ease-out;
    }

    path.empty {
      transition: none;
    }

    text {
      fill: var(--ui-color-gray-800);
      font-family: var(--ui-font-family-label);
      font-size: 12px;
      font-weight: 600;
    }
   `,
};
