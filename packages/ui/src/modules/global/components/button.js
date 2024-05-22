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
  type: 'primary',
  size: '',
  disabled: {
    value: false,
    observe: (host, value) => {
      if (value) {
        host.tabIndex = -1;
      } else {
        host.removeAttribute('tabindex');
      }
    },
  },
  render: () => html`<slot></slot>`.css`
      :host {
        box-sizing: border-box;
        display: grid;
        grid: 1fr / 1fr;
        height: 48px;
        border-radius: 24px;
        white-space: nowrap;
        transition: opacity 0.2s, color 0.2s, background-color 0.2s, border-color 0.2s;
        font: var(--ui-font-button-m);
        text-transform: uppercase;
      }

      :host([type="primary"]) {
        color: var(--ui-color-white);
        background: var(--ui-color-primary-500);
        border: 1px solid var(--ui-color-primary-500);
        --ui-button-hover-color: var(--ui-color-white);
        --ui-button-hover-background: var(--ui-color-primary-700);
      }

      :host([type="success"]) {
        color: var(--ui-color-white);
        background: var(--ui-color-success-500);
        border: 1px solid var(--ui-color-success-500);
        --ui-button-hover-color: var(--ui-color-white);
        --ui-button-hover-background: var(--ui-color-success-700);
      }

      :host([type="transparent"]) {
        border: 1px solid transparent;
        --ui-button-hover-color: var(--ui-color-primary-500);
        --ui-button-hover-background: var(--ui-color-primary-100);
      }

      :host([type="outline"]) {
        color: var(--ui-color-gray-700);
        background: var(--ui-color-white);
        border: 1px solid var(--ui-color-gray-200);
        box-shadow: 0px 2px 6px 0px rgba(32, 44, 68, 0.08);
        --ui-button-hover-color: var(--ui-color-primary-500);
        --ui-button-hover-border: var(--ui-color-primary-500);
        --ui-button-hover-background: var(--ui-color-white);
      }

      :host([type="outline-error"]) {
        color: var(--ui-color-error-400);
        background: var(--ui-color-white);
        border: 1px solid var(--ui-color-gray-200);
        box-shadow: 0px 2px 6px 0px rgba(32, 44, 68, 0.08);
        --ui-button-hover-color: var(--ui-color-error-500);
        --ui-button-hover-border: var(--ui-color-error-500);
        --ui-button-hover-background: var(--ui-color-white);
      }

      @media (hover: hover) and (pointer: fine) {
        :host(:hover), :host(:has(:focus-visible)) {
          color: var(--ui-button-hover-color);
          border-color: var(--ui-button-hover-border);
          background: var(--ui-button-hover-background);
        }
      }

      :host(:active) {
        opacity: 0.6;
      }

      :host([size="small"]) {
        height: 40px;
        font: var(--ui-font-button-s);
      }

      :host([disabled]) {
        background: var(--ui-color-gray-200);
        color: var(--ui-color-gray-400);
        border-color: var(--ui-color-gray-200);
        pointer-events: none;
      }

      :host([disabled]:has(:focus-visible)) {
        visibility: hidden;
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
        border-radius: 24px;
      }

      ::slotted(*:focus-visible) {
        outline: 6px solid rgba(0, 174, 240, 0.15);
      }

      :host([size="small"]) ::slotted(*) {
        padding: 0px 16px;
      }
   `,
};
