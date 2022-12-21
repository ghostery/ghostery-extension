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

function close(host) {
  host.parentNode.removeChild(host);
}

const slide = {
  keyframes: [
    { opacity: 0, transform: 'translateY(-100%)' },
    { opacity: 1, transform: 'translateY(0)' },
  ],
  options: {
    duration: 300,
    easing: 'ease-in-out',
    fill: 'forwards',
  },
};

export default {
  type: '',
  icon: 'alert-info',
  autoclose: {
    value: 0,
    connect(host, key) {
      const delay = host[key];
      if (delay) {
        const timeout = setTimeout(close, delay * 1000, host);
        return () => clearTimeout(timeout);
      }
    },
  },
  slide: {
    value: false,
    connect: (host, key) => {
      const value = host[key];
      if (value) {
        host.animate(slide.keyframes, slide.options);

        const parent = host.parentNode;
        const after = host.nextSibling;

        return () => {
          host.slide = false;
          parent.insertBefore(host, after);

          host
            .animate(slide.keyframes, {
              ...slide.options,
              direction: 'reverse',
            })
            .addEventListener('finish', () => {
              host.parentNode.removeChild(host);
            });
        };
      }
    },
  },
  render: ({ icon, autoclose }) => html`
    <template
      layout="grid:max|1|max items:center gap:0.5 height:5 padding:0:1.5"
      layout[slide]="absolute inset bottom:auto"
    >
      <ui-icon name="${icon}"></ui-icon>
      <ui-text type="label-s" underline layout="block:center">
        <slot></slot>
      </ui-text>
      ${!!autoclose &&
      html`<button onclick="${close}">
        <ui-icon name="close"></ui-icon>
      </button>`}
    </template>
  `.css`
    :host {
      background: var(--ui-color-gray-100);
      border: 1px solid var(--ui-color-gray-200);
      box-shadow: 1px 2px 7px rgba(0, 0, 0, 0.15);
      border-radius: 30px;
      --ui-text-color-heading: currentColor;
      --ui-text-color-anchor: currentColor;
    }

    :host([type="success"]) {
      background: #E1F5E1;
      border-color: #94DD94;
      color: var(--ui-color-success-500);
      box-shadow: 1px 2px 7px rgba(0, 121, 0, 0.15);
    }

    :host([type="info"]) {
      background: var(--ui-color-primary-200);
      border-color: var(--ui-color-primary-300);
      color: var(--ui-color-primary-700);
      box-shadow: 1px 2px 7px rgba(0, 71, 121, 0.15);
    }

    button {
      cursor: pointer;
      appearance: none;
      background: none;
      padding: 0;
      border: none;
      color: inherit;
    }
  `,
};
