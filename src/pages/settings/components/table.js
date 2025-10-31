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
  responsive: { value: false, reflect: true },
  disabled: { value: false, reflect: true },
  render: ({ disabled }) => html`
    <template layout="column gap">
      <header layout="padding:1.5" layout@768px="padding:1.5:2">
        <slot name="header"></slot>
      </header>
      <div layout="column gap" layout@768px="gap:0" inert="${disabled}">
        <slot></slot>
      </div>
    </template>
  `.css`
    :host {
      transition: opacity 0.2s;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    :host([responsive]) div ::slotted(*) {
      border: 1px solid var(--border-primary);
      border-radius: 8px;
    }

    header {
      background: var(--background-secondary);
      border-radius: 8px;
    }

    div ::slotted(*) {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-primary);
    }

    div ::slotted(*:last-child) {
      border-bottom: none;
    }

    @media screen and (min-width: 768px) {
      div ::slotted(*),
      :host([responsive]) div ::slotted(*) {
        padding: 24px 16px;
        border-radius: 0;
        border: none;
        border-bottom: 1px solid var(--border-primary);
      }

      :host([responsive]) div ::slotted(*:last-child) {
        border-bottom: none;
      }
    }
  `,
};
