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
    <template layout="column items:center gap padding:2:0.5">
      <ui-icon name="${icon}" layout="size:4" color="primary-500"></ui-icon>
      <ui-text type="label-xs" layout="block:center" color="gray-600">
        <slot></slot>
      </ui-text>
    </template>
  `.css`
    :host {
      background: var(--ui-color-primary-100);
      border-radius: 16px;
    }
  `,
};
