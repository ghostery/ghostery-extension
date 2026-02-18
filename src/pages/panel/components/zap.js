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
  zapped: { value: false, reflect: true },
  render: () => html`
    <template layout="grid padding:1.5">
      <button layout="row center height:7" data-qa="button:zap" aria-label="Zap">
        <ui-text type="headline-s" color="inherit" layout="row items:center gap:0.5">
          <slot></slot>
        </ui-text>
      </button>
    </template>
  `.css`
    :host {
      background: var(--background-brand-secondary);
    }

    button {
      cursor: pointer;
      border: none;
      border-radius: 8px;
      background: var(--background-brand-solid);
      box-shadow: 0 2px 8px 0 var(--component-pause-button-shadow, rgba(0, 105, 210, 0.20));
      color: var(--color-onbrand);
    }

    :host([zapped]) button {
      border-radius: 8px;
      background: var(--component-pause-button-bg);
      box-shadow: 0 2px 8px 0 var(--component-pause-button-shadow, rgba(0, 105, 210, 0.20));
      color: var(--color-brand-primary);
    }
  `,
};
