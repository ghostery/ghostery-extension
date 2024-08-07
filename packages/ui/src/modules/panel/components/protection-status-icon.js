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

import { html, msg } from 'hybrids';

export default {
  status: undefined, // expected type { type: 'block' | 'trust', website?: boolean }
  blockByDefault: false,
  adjusted: ({ status, blockByDefault }) =>
    status.website || (status.type === 'block') !== blockByDefault,
  render: ({ status, adjusted }) => html`
    <template layout="contents">
      <ui-tooltip>
        <span slot="content">
          ${status.website
            ? (status.type === 'trust' && msg`Trusted on this website`) ||
              (status.type === 'block' && msg`Blocked on this website`)
            : (status.type === 'trust' && msg`Trusted on all websites`) ||
              (status.type === 'block' && msg`Blocked on all websites`)}
        </span>
        <ui-icon
          name="${status.type}-m"
          color="${adjusted ? 'gray-600' : 'gray-300'}"
        ></ui-icon>
        ${status.website &&
        html`
          <ui-icon
            name="error"
            color="gray-600"
            layout="absolute right:1px bottom:1px"
          ></ui-icon>
        `}
      </ui-tooltip>
    </template>
  `,
};
