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

export default define({
  tag: 'ui-button',
  type: 'primary',
  size: '',
  disabled: false,
  render: ({ size }) => html`<slot></slot>`.css`
      :host {
        box-sizing: border-box;
        display: grid;
        grid: 1fr / 1fr;
        height: 48px;
        border-radius: 24px;
        white-space: nowrap;
        transition: opacity 0.2s, color 0.2s, background-color 0.2s, border-color 0.2s;
        font: var(--ui-font-button-${size === 'small' ? 's' : 'm'});
        text-transform: uppercase;
      }

      :host([type="outline"]) {
        background: var(--ui-color-white);
        color: var(--ui-color-gray-700);
        border: 1px solid var(--ui-color-gray-200);
        --ui-button-color-hover: var(--ui-color-primary-500);
      }

      :host([type="primary"]) {
        color: var(--ui-color-white);
        background: var(--ui-color-primary-500);
        --ui-button-color-hover: var(--ui-color-primary-700);
      }

      :host([type="secondary"]) {
        background: var(--ui-color-gray-700);
      }

      @media (hover: hover) and (pointer: fine) { 
        :host([type="outline"]:hover) {
          color: var(--ui-button-color-hover);
          border-color: var(--ui-button-color-hover);
        }

        :host([type="primary"]:hover) {
          background: var(--ui-button-color-hover);
        }
      }

      :host(:active) {
        opacity: 0.6;
      }

      :host([size="small"]) {
        height: 40px;
      }

      :host([disabled]) {
        background: var(--ui-color-gray-200);
        color: var(--ui-color-gray-400);
        border-color: var(--ui-color-gray-200);
        pointer-events: none;
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
      }

      :host([size="small"]) ::slotted(*) {
        padding: 0px 12px;
      }
   `,
});
