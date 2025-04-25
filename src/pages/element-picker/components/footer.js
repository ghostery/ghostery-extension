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
    <template layout="row items:center content:space-between padding:2 gap:2">
      <slot></slot>
    </template>
  `.css`
      :host {
        border-top: 1px solid var(--border-primary);
      }
    `,
};
