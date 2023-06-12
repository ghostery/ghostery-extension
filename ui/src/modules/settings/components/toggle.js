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

import { html, dispatch } from 'hybrids';

function toggle(host) {
  host.value = !host.value;
  dispatch(host, 'change');
}

export default {
  value: false,
  render: Object.assign(
    ({ value }) => html`
      <template layout="block">
        <button
          onclick="${toggle}"
          layout="row items:center gap padding:0.5 margin:0"
        >
          <div id="toggle" layout="block relative size:36px:20px">
            <span layout="block size:2 absolute top left margin:2px"></span>
          </div>
          <ui-text type="label-m" layout="width::36px">
            ${value ? html`On` : html`Off`}
          </ui-text>
        </button>
      </template>
    `.css`
      button {
        background: none;
        appearance: none;
        border: none;
        --ui-text-color-heading: var(--ui-color-danger-500);
        -webkit-tap-highlight-color: transparent;
      }

      ui-text {
        text-transform: uppercase;
        transition: color 0.2s;
      }

      #toggle {
        background: var(--ui-color-danger-500);
        border-radius: 12px;
        transition: color 0.2s;
      }

      #toggle span {
        background: var(--ui-color-white);
        border-radius: 8px;
        transition: left 0.2s;
      }

      :host([value]) #toggle {
        background: var(--ui-color-success-500);
      }

      :host([value]) button {
        --ui-text-color-heading: var(--ui-color-success-500);
      }

      :host([value]) #toggle span {
        left: calc(100% - 20px);
      }

      @media (hover: hover) and (pointer: fine) {
        button:hover {
          --ui-text-color-heading: var(--ui-color-danger-700);
        }

        button:hover #toggle {
          background: var(--ui-color-danger-700);
        }

        :host([value]) button:hover {
          --ui-text-color-heading: var(--ui-color-success-700);
        }

        :host([value]) button:hover #toggle {
          background: var(--ui-color-success-700);
        }
      }
    `,
    { delegateFocus: true },
  ),
};
