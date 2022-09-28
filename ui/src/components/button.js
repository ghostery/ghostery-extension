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
  disabled: false,
  render: ({ size }) => html`
    <ui-text type="button-${size === 'small' ? 's' : 'm'}">
      <slot></slot>
    </ui-text>
  `.css`
      :host {
        box-sizing: border-box;
        display: grid;
        grid: 1fr / 1fr;
        height: 48px;
        border-radius: 24px;
        white-space: nowrap;
      }

      :host([type="outline"]) {
        background: var(--ui-color-white);
        color: var(--ui-color-gray-700);
        border: 1px solid var(--ui-color-gray-200);
      }

      :host([type="outline"]:hover) {
        color: var(--ui-color-primary-500);
        border-color: var(--ui-color-primary-500);
      }

      :host([type="primary"]) {
        color: var(--ui-color-white);
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

      :host([disabled]) {
        opacity: 0.5;
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
      }
   `,
});
