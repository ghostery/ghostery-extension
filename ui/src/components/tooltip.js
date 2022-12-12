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

const timeouts = new WeakMap();

export default define({
  tag: 'ui-tooltip',
  autohide: 2000,
  show: {
    value: false,
    connect: (host) => () => clearTimeout(timeouts.get(host)),
    observe: (host, value) => {
      const tooltip = host.render().querySelector('#tooltip');
      tooltip.hidden = !value;
      tooltip.style.transform = '';

      if (value) {
        const { left, width } = tooltip.getBoundingClientRect();

        const overflowRight = left + width + 8 - window.innerWidth;
        const overflowLeft = left - 8;

        if (overflowRight > 0) {
          tooltip.style.transform = `translateX(calc(-50% - ${overflowRight}px)`;
        } else if (overflowLeft < 0) {
          tooltip.style.transform = `translateX(calc(-50% + ${Math.abs(
            overflowLeft,
          )}px)`;
        }

        if (host.autohide) {
          timeouts.set(
            host,
            setTimeout(() => {
              host.show = false;
            }, host.autohide),
          );
        }
      } else {
        clearTimeout(timeouts.get(host));
      }
    },
  },
  render: () => html`
    <template layout="block relative">
      <slot
        onmouseenter="${html.set('show', true)}"
        onmouseleave="${html.set('show', false)}"
      ></slot>
      <div id="tooltip" layout="absolute layer bottom:full left:50%" hidden>
        <ui-text
          type="label-s"
          layout="block:center margin:bottom:0.5 padding:0.5:1"
        >
          <slot name="content"></slot>
        </ui-text>
      </div>
    </template>
  `.css`
    #tooltip {
      pointer-events: none;
      transform: translateX(-50%);
    }

    #tooltip ui-text {
      background: var(--ui-color-white);
      border: 0.5px solid var(--ui-color-gray-300);
      box-shadow: 0px 4px 12px rgba(32, 44, 68, 0.2);
      border-radius: 4px;
      white-space: nowrap;  
    }
  `,
});
