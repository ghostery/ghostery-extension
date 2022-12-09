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

import { define, html } from 'hybrids';

export default define({
  tag: 'ui-panel-badge',
  render: () => html`
    <template layout="row center width::2 height:2 padding:0:0.25">
      <ui-text type="label-xs" color="gray-500"><slot></slot></ui-text>
    </template>
  `.css`
    :host {
      box-sizing: border-box;
      border: 1px solid var(--ui-color-gray-200);
      border-radius: 4px;
    }
  `,
});
