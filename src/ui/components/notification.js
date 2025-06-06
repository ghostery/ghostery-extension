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
  icon: '',
  alert: false,
  render: ({ icon, alert }) => html`
    <template layout="block">
      <ui-card narrow layout="relative padding:2">
        <ui-icon
          name="logo"
          layout="absolute bottom:2 right:2 size:3"
        ></ui-icon>
        <div layout="row items:start gap:2">
          ${icon &&
          html`
            <div layout="relative">
              <ui-icon
                name="${icon}"
                layout="size:6"
                color="gray-300"
              ></ui-icon>
              ${alert &&
              html`
                <ui-icon
                  name="alert"
                  color="danger-500"
                  layout="absolute bottom:0 right:0"
                ></ui-icon>
              `}
            </div>
          `}
          <div layout="column gap:2">
            <slot></slot>
          </div>
        </div>
      </ui-card>
    </template>
  `,
};
