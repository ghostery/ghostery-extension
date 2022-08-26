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
  size: 'medium',
  render: ({ size }) => html`
    <ui-text type="button-${size === 'small' ? 's' : 'm'}"
      ><slot></slot
    ></ui-text>
  `.css`
      :host {
        box-sizing: border-box;
        display: grid;
        grid: 1fr / 1fr;
        height: 48px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.12);
        border-radius: 24px;
        color: white;
      }

      :host([type^="outline"]) {
        background: transparent;
        border: 2px solid var(--ui-color-gray-600);
      }

      :host([type="outline"]:hover) {
        border-color: white;
      }
      
      :host([type="outline-light"]) {
        color: var(--ui-color-gray-700);
        border-color: var(--ui-color-gray-300);
      }

      :host([type="outline-light"]:hover) {
        border-color: var(--ui-color-gray-400);
      }

      :host([type="primary"]) {
        background: var(--ui-color-primary-500);
      }

      :host([type="primary"]:hover) {
        background: var(--ui-color-primary-700);
      }

      :host([type="secondary"]) {
        background: var(--ui-color-gray-700);
      }

      :host([size="small"]) {
        height: 40px;
      }

      :host([type^="outline"]) ::slotted(*) {
        margin: -2px;
        height: calc(100% + 4px);
        width: calc(100% + 4px);
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
      }
   `,
});
