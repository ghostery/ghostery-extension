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
  type: { value: 'outline', reflect: true },
  disabled: {
    value: false,
    observe: (host, value) => {
      if (value) {
        host.tabIndex = -1;
      } else {
        host.removeAttribute('tabindex');
      }
    },
    reflect: true,
  },
  render: () => html`<slot></slot>`.css`
    :host {
      display: block;
      box-sizing: border-box;
      height: 40px;
      font: var(--ui-font-label-m);
      border-radius: 8px;
      white-space: nowrap;
      transition: opacity 0.2s, color 0.2s, background-color 0.2s, border-color 0.2s;
      box-shadow: 0px 2px 6px 0px rgba(32, 44, 68, 0.08);
    }

    :host([hidden]) {
      display: none;
    }

    :host([type="primary"]) {
      color: white;
      background: var(--ui-color-primary-500);
      border: 1px solid var(--ui-color-primary-500);
    }

    :host([type="success"]) {
      color: white;
      background: var(--ui-color-success-500);
      border: 1px solid var(--ui-color-success-500);
    }

    :host([type="danger"]) {
      color: white;
      background: var(--ui-color-danger-500);
      border: 1px solid var(--ui-color-danger-500);
    }

    :host([type="transparent"]) {
      border: 1px solid transparent;
      box-shadow: none;
    }

    :host([type="outline"]) {
      color: var(--ui-color-gray-700);
      background: var(--ui-color-layout);
      border: 1px solid var(--ui-color-gray-200);
    }

    :host([type="outline-primary"]) {
      color: var(--ui-color-primary-700);
      background: var(--ui-color-layout);
      border: 1px solid var(--ui-color-primary-700);
    }

    :host([type="outline-danger"]) {
      color: var(--ui-color-danger-500);
      background: var(--ui-color-layout);
      border: 1px solid var(--ui-color-danger-300);
    }

    :host(:active) {
      opacity: 0.6;
    }

    :host([disabled]) {
      background: var(--ui-color-gray-200);
      color: var(--ui-color-gray-400);
      border-color: var(--ui-color-gray-200);
      pointer-events: none;
    }

    @media (hover: hover) {
      :host([type="primary"]:hover) {
        background: var(--ui-color-primary-700);
      }

      :host([type="success"]:hover) {
        background: var(--ui-color-success-700);
      }

      :host([type="danger"]:hover) {
        background: var(--ui-color-danger-700);
      }

      :host([type="transparent"]:hover) {
        text-decoration: underline;
      }

      :host([type="outline"]:hover) {
        border-color: var(--ui-color-gray-300);
      }

      :host([type="outline-primary"]:hover) {
        background: var(--ui-color-primary-100);
      }

      :host([type="outline-danger"]:hover) {
        border-color: var(--ui-color-danger-500);
      }
    }

    ::slotted(*) {
      display: grid;
      grid-auto-flow: column;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      place-items: center;
      appearance: none;
      border: none;
      padding: 0px 24px;
      margin: 0;
      background: none;
      color: inherit;
      font: inherit;
      text-transform: inherit;
      text-decoration: none;
      border-radius: 8px;
      padding: 0px 16px;
    }

    ::slotted(*:focus-visible) {
      outline: 2px solid var(--ui-color-primary-700);
    }
  `,
};
