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
import * as labels from '../labels.js';

export default {
  name: '',
  closed: { value: false, reflect: true },
  render: ({ name, closed }) => html`
    <template layout="column gap:1.5 padding:1:1.5">
      ${name &&
      html`<ui-action>
        <button
          id="header"
          onclick="${html.set('closed', !closed)}"
          layout="row items:center gap overflow padding margin:-1"
        >
          <ui-category-icon name="${name}"></ui-category-icon>
          <ui-text type="label-m">${labels.categories[name]}</ui-text>
          <ui-icon
            id="arrow"
            name="arrow-down"
            color="gray-600"
            layout="margin:right:-0.5"
          ></ui-icon>
          <div layout="grow"></div>
          <slot name="header"></slot>
        </button>
      </ui-action>`}
      <div
        id="content"
        class="${{ name }}"
        layout="column grow"
        layout.name="margin:left:4"
      >
        <slot></slot>
      </div>
    </template>
  `.css`
    :host {
      border: 1px solid var(--ui-color-gray-200);
      border-bottom: none;
    }

    :host(:first-of-type) {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    :host(:last-of-type) {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      border-bottom: 1px solid var(--ui-color-gray-200);
    }

    @media (hover: hover) {
      #header:hover ui-text {
        color: var(--ui-color-primary-700);
      }
    }

    #header:focus-visible ui-text {
      color: var(--ui-color-primary-700);
    }

    #arrow {
      transform: rotate(180deg);
      transition: transform 0.1s;
    }

    :host([closed]) #arrow {
      transform: rotate(0deg);
    }

    :host([closed]) #content {
      display: none;
    }
  `,
};
