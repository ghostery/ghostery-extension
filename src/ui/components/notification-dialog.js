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

import { dispatch, html } from 'hybrids';

function close(host) {
  dispatch(host, 'close');
}

export default {
  render: () => html`
    <template layout="block">
      <ui-card narrow layout="relative padding:0">
        <header layout="grid:32px|1|32px gap padding:0.5:1 items:center">
          <ui-icon name="logo" layout="size:2.5"></ui-icon>
          <ui-text type="label-m"><slot name="title"></slot></ui-text>
          <ui-button onclick="${close}" type="transparent" size="s">
            <button>
              <ui-icon name="close" color="quaternary" layout="size:2.5"></ui-icon>
            </button>
          </ui-button>
        </header>
        <ui-line></ui-line>
        <div layout="column gap:1.5 padding:2:1.5">
          <slot></slot>
        </div>
      </ui-card>
    </template>
  `,
};
