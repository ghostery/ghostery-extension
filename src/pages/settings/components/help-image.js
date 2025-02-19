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
  static: false,
  render: (host) =>
    html`
      <template
        layout="row center relative overflow size:10:7 shrink:0"
        layout@768px="size:12:8"
      >
        ${host.static
          ? html`<slot></slot>`
          : html`
              <div
                id="icon"
                layout="absolute top:2px right:2px row center size:3"
              >
                <ui-icon
                  name="zoom-in"
                  color="primary"
                  layout="size:2"
                ></ui-icon>
              </div>
              <ui-action><slot></slot></ui-action>
            `}
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
