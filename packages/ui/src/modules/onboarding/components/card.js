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
  render: ({ type }) => html`
    <template layout="column padding:3">
      <div class="${{ [type]: type }}">
        <slot></slot>
      </div>
    </template>
  `.css`
    :host {
      background: var(--ui-color-onboarding-card);
      border-radius: 16px;
      box-shadow: 15px 30px 80px rgba(0, 0, 0, 0.15);
    }

    :host([type="transparent"]) {
      background: none;
      box-shadow: none;
      border: none;
    }
  `,
};
