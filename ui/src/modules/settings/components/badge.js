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
  type: 'danger',
  render: () => html`
    <template layout="row center padding:0.5:1">
      <ui-text type="label-s" color="settings-badge"><slot></slot></ui-text>
    </template>
  `.css`
    :host {
      border-radius: 8px;
      --ui-color-settings-badge: currentColor;
    }
    
    :host([type="danger"]) {
      color: var(--ui-color-danger-700);
      background: var(--ui-color-danger-100);
    }

    ui-text {
      text-transform: uppercase;
    }
  `,
};
