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

import { html, msg, dispatch } from 'hybrids';

function toggle(host) {
  host.value = !host.value;
  dispatch(host, 'change');
}

function stopForAnchors(host, event) {
  let target = event.target;
  while (target && target.tagName !== 'A') {
    target = target.parentElement;
  }
  if (target) {
    event.stopPropagation();
  }
}

export default {
  value: { value: false, reflect: true },
  disabled: { value: false, reflect: true },
  noLabel: { value: false, reflect: true },
  render: {
    value: ({ disabled, value }) => html`
      <template layout="grid">
        <button
          onclick="${toggle}"
          layout="row items:start gap:2 padding:0.5 margin:-0.5"
          tabindex="${disabled ? -1 : 0}"
        >
          <div layout="self:stretch grow row" onclick="${stopForAnchors}">
            <slot></slot>
          </div>
          <div id="button" layout="row items:center gap padding:0.5 margin:0">
            <div id="toggle" layout="block relative size:36px:20px">
              <span layout="block size:2 absolute top left margin:2px"></span>
            </div>
            <ui-text type="label-m" layout="width::36px" color="inherit">
              ${value ? msg`On` : msg`Off`}
            </ui-text>
          </div>
        </button>
      </template>
    `.css`
      :host([disabled]) {
        pointer-events: none;
      }

      button {
        cursor: pointer;
        background: none;
        appearance: none;
        border: none;
        -webkit-tap-highlight-color: transparent;
        margin: 0;
        padding: 0;
        text-align: left;
        outline-color: var(--border-brand-solid);
      }

      ui-text {
        text-transform: uppercase;
        transition: color 0.2s;
      }

      #button { color: var(--color-primary); }

      #toggle {
        background: var(--color-quaternary);
        border-radius: 12px;
        transition: color 0.2s, background 0.2s;
      }

      #toggle span {
        background: var(--background-primary);
        border-radius: 8px;
        transition: left 0.2s;
      }

      :host([value]) #toggle { background: var(--color-primary); }
      :host([value]) #toggle span { left: calc(100% - 20px); }


      :host([disabled]) #button { color: var(--color-secondary); }
      :host([disabled]) #toggle { background: var(--background-tertiary); }
      :host([disabled]) #toggle span { background: var(--background-secondary); }

      :host([no-label]) ui-text { display: none; }
    `,
    shadow: { delegateFocus: true },
  },
};
