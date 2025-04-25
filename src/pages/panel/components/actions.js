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
  hostname: '',
  open: false,
  render: ({ hostname, open }) => html`
    <template layout="block">
      <div
        id="button"
        layout="fixed layer:100 top:0 left:0 right:0 height:6 row center"
      >
        <ui-button size="s" slot="button" onclick="${html.set('open', !open)}">
          <button>
            <ui-text type="label-m">${hostname}</ui-text>
            <ui-icon
              name="chevron-down"
              class="${{ open }}"
              color="secondary"
              layout="size:2 margin:right:-1"
            ></ui-icon>
          </button>
        </ui-button>
      </div>
      <div
        id="overlay"
        class="${{ open }}"
        layout="fixed layer:1 inset top:6"
        onclick="${html.set('open', false)}"
      ></div>
      <div
        id="actions"
        class="${{ open }}"
        inert="${!open}"
        layout="fixed layer:1 top:6 left:0 right:0 grid:3 gap padding:1.5"
        onclick="${html.set('open', false)}"
      >
        <slot></slot>
      </div>
    </template>
  `.css`
    ui-icon {
      transition: transform 0.2s ease-in-out;
    }

    ui-icon.open {
      transform: rotate(180deg);
    }

    #button {
      pointer-events: none;
    }

    #button ui-button {
      pointer-events: all;
    }

    #overlay {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease-out;
      background: var(--component-custom-token-modal-overlay);
      backdrop-filter: blur(2px);
    }

    #overlay.open {
      opacity: 1;
      pointer-events: all;
    }

    #actions {
      border-top: 1px solid var(--border-primary);
      background: var(--background-primary);
      transform: translateY(-100%);
      transition: transform 0.2s ease-out;
    }

    #actions.open {
      transform: translateY(0);
    }
  `,
};
