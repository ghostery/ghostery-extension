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

import { openTabWithUrl } from '/utils/tabs.js';

export default {
  type: { value: '', reflect: true },
  icon: '',
  value: '',
  href: '',
  render: ({ icon, value, href }) => html`
    <template layout="column grow">
      <ui-button inert="${!href}" layout="grow">
        <a
          href="${href}"
          onclick="${openTabWithUrl}"
          layout="column center padding:0.5 gap:0"
        >
          <div layout="row items:center gap:0.5 height:22px">
            <ui-icon name="${icon}" layout="size:2"></ui-icon>
            ${!!value && html`<ui-text type="headline-s">${value}</ui-text>`}
          </div>
          <ui-text type="label-xs" layout="block:center width::80px">
            <slot></slot>
          </ui-text>
        </a>
      </ui-button>
    </template>
  `.css`
    ui-button {
      border-color: transparent;
      white-space: wrap;
      height: auto;
    }

    :host([type="blocked"]) ui-icon {
      color: var(--background-danger-strong);
    }

    :host([type="modified"]) ui-icon {
      color: var(--background-brand-strong);
    }

    :host([type="autoconsent"]) ui-icon {
      color: var(--background-wtm-solid);
    }

    :host([type="content"]) ui-icon {
      color: var(--background-brand-solid);
    }

    @media (hover: hover) {
      :host([type="content"]) ui-button:hover {
        background-color: var(--background-brand-primary);
        border: 1px solid var(--border-brand-secondary);
      }
    }
  `,
};
