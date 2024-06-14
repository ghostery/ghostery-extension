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

const timeouts = new WeakMap();

let activeTooltip = null;

const delayTimeouts = new WeakMap();
function toggle(value) {
  return (host) => {
    clearTimeout(delayTimeouts.get(host));

    if (host.delay && value) {
      delayTimeouts.set(
        host,
        setTimeout(() => {
          host.show = value;
        }, host.delay * 1000),
      );
    } else {
      host.show = value;
    }
  };
}

export default {
  autohide: 2,
  wrap: { value: false, reflect: true },
  position: 'top', // top, bottom
  delay: 1,
  inline: false,
  show: {
    value: false,
    connect: (host) => () => clearTimeout(timeouts.get(host)),
    observe: (host, value) => {
      const tooltip = host.render().querySelector('#tooltip');
      tooltip.hidden = !value;
      tooltip.style.transform = '';

      if (value) {
        if (activeTooltip && activeTooltip !== host) {
          activeTooltip.show = false;
        }
        activeTooltip = host;

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
            }, host.autohide * 1000),
          );
        }
      } else {
        clearTimeout(timeouts.get(host));
      }
    },
  },
  render: ({ position, inline }) => html`
    <template layout="contents">
      <div
        ontouchstart="${toggle(true)}"
        onmouseenter="${toggle(true)}"
        onmouseleave="${toggle(false)}"
        onclick="${toggle(false)}"
        class="${{ inline }}"
        layout="block relative"
        layout.inline="block inline"
      >
        <slot></slot>
        <div
          id="tooltip"
          class="${position}"
          layout="absolute left:50% layer:90"
          layout.top="bottom:full"
          layout.bottom="top:full"
          hidden
        >
          <ui-text
            type="label-s"
            layout="block:center margin:0.5:0 padding:0.5:1"
          >
            <slot name="content"></slot>
          </ui-text>
        </div>
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

    :host([wrap]) #tooltip ui-text {
      white-space: normal;
    }
  `,
};
