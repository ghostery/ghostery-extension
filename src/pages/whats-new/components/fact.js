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
    <template layout="column gap:2 padding:2">
      <slot></slot>
    </template>
  `.css`
    :host {
      /* Translucent, so the header wave stays visible underneath */
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--background-primary) 90%, transparent) 0%,
        var(--background-primary) 100%
      );
      border: 1px solid var(--border-primary);
      border-radius: 24px;
      box-shadow: 0px 4px 12px 0px var(--shadow-card);
    }
  `,
};
