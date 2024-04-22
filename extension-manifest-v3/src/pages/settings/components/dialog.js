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

import { html, router } from 'hybrids';

function close(host) {
  host.shadowRoot.querySelector('a').click();
}

export default {
  open: {
    value: false,
    connect(host, key) {
      const timeout = setTimeout(() => {
        host[key] = true;
      });
      return () => clearTimeout(timeout);
    },
  },
  render: () => html`
    <template layout="row center fixed inset padding layer:400">
      <div id="backdrop" layout="absolute inset:0" onclick="${close}"></div>
      <div
        id="dialog"
        layout="
          relative grid::max|1
          basis:480px height:auto::94vh
          margin:0 padding:4:3
          overflow:y:auto
        "
        layout@768px="padding:5"
      >
        <ui-action>
          <a
            href="${router.backUrl()}"
            layout="absolute top:2 right:2 padding:0.5"
            tabindex="100"
          >
            <ui-icon name="close" color="gray-400" layout="size:3"></ui-icon>
          </a>
        </ui-action>
        <slot></slot>
      </div>
    </template>
  `.css`
    #dialog {
      border: none;
      border-radius: 16px;
      background: var(--ui-color-white);
      transform: translateY(100px);
      opacity: 0;
      transition: transform 250ms cubic-bezier(0.4, 0.15, 0, 1), opacity 250ms ease;
    }

    :host([open]) #dialog {
      transform: translateY(0);
      opacity: 1;
    }

    #backdrop {
      background: var(--ui-color-gray-900);
      opacity: 0;
      transition: all 500ms ease-out;
    }

    :host([open]) #backdrop {
      opacity: 0.7;
    }
  `,
};
