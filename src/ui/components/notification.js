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
  alert: false,
  render: ({ alert }) => html`
    <template layout="block">
      <ui-card narrow layout="padding:1.5">
        <div layout="row items:start gap">
          <div layout="relative">
            <ui-icon name="logo" layout="size:4"></ui-icon>
            ${alert &&
            html`
              <ui-icon
                name="alert"
                color="danger-500"
                layout="absolute bottom:-1 right:-1"
              ></ui-icon>
            `}
          </div>
          <div layout="column gap:1.5">
            <slot></slot>
          </div>
        </div>
      </ui-card>
    </template>
  `,
};
