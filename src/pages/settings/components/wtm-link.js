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
    <template layout="row items:center gap:2 padding:1.5:2">
      <ui-icon name="wtm-logo" color=""></ui-icon>
      <ui-text type="label-m" layout="grow"><slot></slot></ui-text>
      <ui-icon name="chevron-right" color="primary"></ui-icon>
    </template>
  `.css`
    :host {
      border-radius: 16px;
      background: var(--background-brand-primary);
    }
  `,
};
