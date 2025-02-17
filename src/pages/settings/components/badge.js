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
      <ui-text type="label-s" layout="row items:center gap:0.5">
        <slot></slot>
      </ui-text>
    </template>
  `.css`
    :host {
      border-radius: 8px;
      background: var(--background-secondary);
    }

    :host([type="brand"]) {
      background: var(--background-brand-secondary);
    }

    :host([type="success"]) {
      background: var(--background-success-secondary);
    }

    :host([type="warning"]) {
      background: var(--background-warning-secondary);
    }

    :host([type="danger"]) {
      background: var(--background-danger-secondary);
    }

    :host([uppercase]) ui-text {
      text-transform: uppercase;
    }
  `,
};
