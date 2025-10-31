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
    reflect: true,
    connect(host, key) {
      const timeout = setTimeout(() => {
        host[key] = true;
      });
      return () => clearTimeout(timeout);
    },
  },
  closable: false,
  render: ({ closable }) => html`
    <template layout="row center fixed inset padding layer:400">
      <div id="backdrop" layout="absolute inset:0" onclick="${close}"></div>
      <div
        id="dialog"
        layout="
          relative grid::max|1
          basis:480px height:auto::94vh
          margin:0 padding:3
          overflow:y:auto
        "
      >
        ${closable &&
        html`
          <ui-action>
            <a
              href="${router.backUrl()}"
              layout="absolute top:2 right:2 padding:0.5"
              tabindex="100"
            >
              <ui-icon name="close" color="tertiary" layout="size:3"></ui-icon>
            </a>
          </ui-action>
        `}
        <slot></slot>
      </div>
    </template>
  `.css`
    #dialog {
      border: none;
      border-radius: 16px;
      background: var(--background-primary);
      transform: translateY(-60px);
      opacity: 0;
      transition: transform 200ms cubic-bezier(0.4, 0.15, 0, 1), opacity 200ms ease;
      will-change: transform, opacity;
    }

    :host([open]) #dialog {
      transform: translateY(0);
      opacity: 1;
    }

    #backdrop {
      background: var(--component-custom-token-modal-overlay);
      opacity: 0;
      transition: all 200ms;
      will-change: opacity;
    }

    :host([open]) #backdrop {
      opacity: 1;
    }
  `,
};
