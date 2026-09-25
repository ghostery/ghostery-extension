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

// The dialog fills its view element, which the settings page styles.css turns into
// the overlay - the view element is the only part of the dialog in the document tree,
// so it is the only one the router's view transition can capture and animate
export default {
  closable: false,
  render: ({ closable }) => html`
    <template layout="row center absolute inset:0 padding">
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
        ${
          closable &&
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
          `
        }
        <slot></slot>
      </div>
    </template>
  `.css`
    :host {
      pointer-events: auto;
    }

    #dialog {
      border: none;
      border-radius: 16px;
      background: var(--background-primary);
    }

    #backdrop {
      background: var(--component-custom-token-modal-overlay);
    }
  `,
};
