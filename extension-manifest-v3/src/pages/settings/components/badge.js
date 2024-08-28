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
  type: { value: 'danger', reflect: true },
  uppercase: false,
  render: () => html`
    <template layout="row center padding:0.5:1">
      <ui-text type="label-s" layout="row items:center gap:0.5">
        <slot></slot>
      </ui-text>
    </template>
  `.css`
    :host {
      border-radius: 8px;
    }

    ui-text {
      color: inherit;
    }

    :host([type="danger"]) {
      color: var(--ui-color-danger-700);
      background: var(--ui-color-danger-100);
    }

    :host([type="primary"]) {
      color: var(--ui-color-primary-700);
      background: var(--ui-color-primary-100);
    }

    :host([type="info"]) {
      color: var(--ui-color-gray-800);
      background: var(--ui-color-gray-100);
    }

    :host([type="success"]) {
      color: var(--ui-color-success-700);
      background: var(--ui-color-success-100);
    }

    :host([type="warning"]) {
      color: var(--ui-color-warning-text);
      background: var(--ui-color-warning-500);
    }

    :host([uppercase]) ui-text {
      text-transform: uppercase;
    }
  `,
};
