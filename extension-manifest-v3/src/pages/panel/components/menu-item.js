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
  icon: '',
  render: ({ icon }) => html`
    <template layout="grid:max|1|max items:center:start gap:1.5">
      <ui-icon name="${icon}" layout="size:2.5"></ui-icon>
      <ui-text type="label-m" ellipsis layout="column width::0:full">
        <slot></slot>
      </ui-text>
      <ui-icon name="arrow-right"></ui-icon>
    </template>
  `.css`
    :host {
      text-decoration: none;
      color: var(--ui-color-gray-800);
    }

    ui-icon {
      color: var(--ui-color-gray-600);
    }

    ui-text ::slotted(*) {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    @media (hover: hover) {
      :host(:hover) ui-text {
        color: var(--ui-color-primary-700);
      }

      :host(:hover) ui-icon {
        color: var(--ui-color-primary-700);
      }
    }
  `,
};
