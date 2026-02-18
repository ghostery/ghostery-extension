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
  type: { value: '', reflect: true },
  uppercase: false,
  render: () => html`
    <template layout="row center padding:0.5:1">
      <ui-text type="label-s" color="inherit" layout="row items:center gap:0.5 relative">
        <slot></slot>
      </ui-text>
    </template>
  `.css`
    :host {
      border-radius: 8px;
      color: var(--color-primary);
      background: var(--background-secondary);
    }

    :host([type="brand"]) {
      color: var(--color-brand-primary);
      background: var(--background-brand-secondary);
    }

    :host([type="success"]) {
      color: var(--color-success-primary);
      background: var(--background-success-secondary);
    }

    :host([type="warning"]) {
      color: var(--color-warning-primary);
      background: var(--background-warning-secondary);
    }

    :host([type="danger"]) {
      color: var(--color-danger-primary);
      background: var(--background-danger-secondary);
    }

    :host([type="pause-assistant"]) {
      color: var(--color-onbrand);
      background: transparent;
      position: relative;
      overflow: hidden;
    }

    :host([type="pause-assistant"])::before {
      content: '';
      position: absolute;
      inset: -20px;
      background: var(--background-gradient-pause-assistant);
      filter: blur(15px);
    }

    :host([uppercase]) ui-text {
      text-transform: uppercase;
    }
  `,
};
