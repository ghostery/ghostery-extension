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
  name: '',
  color: '',
  render: ({ name, color }) =>
    html`
      <template layout="block padding">
        <ui-icon name="${name}" color="${color}" layout="size:3">
          <slot></slot>
        </ui-icon>
      </template>
    `.css`
      :host {
        background: var(--background-${color});
        border-radius: 50%;
      }
    `,
};
