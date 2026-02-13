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
  number: 0,
  icon: '',
  type: { value: '', reflect: true },
  render: ({ number, icon }) => html`
    <template layout="row center relative size:80px:40px shrink:0">
      <div layout="row center absolute top:-4px left:-4px size:22px">
        <ui-text type="label-s" color="inherit">${number}</ui-text>
      </div>

      <ui-icon name="${icon}" color="inherit" layout="size:3"></ui-icon>
    </template>
  `.css`
    :host {
      border-radius: 100px;
    }

    div {
      border-radius: 100%;
      border: 2px solid var(--background-primary);
    }

    :host([type="brand"]) {
      background: var(--background-brand-secondary);
      color: var(--color-brand-secondary);
    }

    :host([type="brand"]) div {
      color: var(--color-onbrand);
      background: var(--color-brand-secondary);
    }

    :host([type="danger"]) {
      background: var(--background-danger-primary);
      color: var(--color-danger-secondary);
    }

    :host([type="danger"]) div {
      color: var(--color-onbrand);
      background: var(--color-danger-secondary);
    }

    :host([type="success"]) {
      background: var(--background-success-primary);
      color: var(--color-success-secondary);
    }

    :host([type="success"]) div {
      color: var(--color-onbrand);
      background: var(--color-success-secondary);
    }
  `,
};
