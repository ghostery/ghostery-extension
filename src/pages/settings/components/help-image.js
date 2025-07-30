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
  render: () =>
    html`
      <template
        layout="column overflow size:96px:64px shrink:0"
        layout@768px="size:120px:80px"
      >
        <slot></slot>
      </template>
    `.css`
      :host {
        background: var(--background-secondary);
        border: 1px solid var(--border-primary);
        border-radius: 4px;
      }

      #icon {
        border-radius:12px;
        border: 1px solid var(--border-primary);
        background: var(--background-primary);
      }
    `,
};
