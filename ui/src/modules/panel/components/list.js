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

import { define, html } from 'hybrids';
import { getCategoryColor } from '../../../utils/categories.js';
import * as labels from '../../../utils/labels.js';

export default define({
  tag: 'ui-panel-list',
  name: '',
  closed: false,
  render: ({ name, closed }) => html`
    <template layout="column gap:1.5">
      <button
        id="header"
        onclick="${html.set('closed', !closed)}"
        layout="row items:center gap"
      >
        <ui-icon
          id="icon"
          name="panel-heart"
          layout="relative size:2"
        ></ui-icon>
        <ui-text type="label-m">${labels.categories[name]}</ui-text>
        <slot name="header"></slot>
        <div layout="grow"></div>
        <ui-icon id="arrow" name="arrow-down" color="gray-500"></ui-icon>
      </button>
      <div id="content" layout="margin:left:4">
        <slot></slot>
      </div>
    </template>
  `.css`
    :host {
      padding: 8px 8px 12px 12px;
      border: 1px solid var(--ui-color-gray-200);
      border-bottom: none;
    }

    :host(:first-of-type) {
      border-radius: 8px 8px 0 0;
    }

    :host(:last-of-type) {
      border-radius: 0 0 8px 8px;
      border-bottom: 1px solid var(--ui-color-gray-200);
    }

    #header {
      cursor: pointer;
      padding: 0;
      background: none;
      appearance: none;
      border: none;
      overflow: hidden;
    }

    #header:is(:hover, :focus-visible) ui-text {
      color: var(--ui-color-primary-700);
    }

    #icon {
      padding: 4px;
      color: ${getCategoryColor(name)};
    }

    #icon::before {
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      background: ${getCategoryColor(name)};
      opacity: 0.15;
      border-radius: 4px;
    }

    #arrow {
      transition: transform 0.1s;
    }

    :host([closed]) #arrow {
      transform: rotate(180deg);
    }

    #content ::slotted(*) {
      --ui-link-color-hover: var(--ui-color-primary-700);
    }

    :host([closed]) #content {
      display: none;
    }
  `,
});
