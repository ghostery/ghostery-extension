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
  render: () => html`
    <template layout="block">
      <ui-text type="label-m" layout="grid margin:1.5" color="white">
        <slot></slot>
      </ui-text>
    </template>
  `.css`
    :host {
      background: var(--ui-color-primary-200);
    }

    ui-text {
      background: var(--ui-color-primary-500);
      box-shadow: 0px 2px 8px rgba(0, 105, 210, 0.2);
      border-radius: 8px;
      height: 48px;
      transition: 0.2s all;
    }

    @media (hover: hover) and (pointer: fine) {
      ui-text:hover {
        background: var(--ui-color-primary-700);
      }
    }

    ui-text:active {
      opacity: 0.6;
    }

    ui-text ::slotted(a) {
      text-decoration: none;
    }
  `,
};
