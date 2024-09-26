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

function clickSlottedElement(host, event) {
  const target = host.render().querySelector('slot').assignedElements()[0];
  if (event.target !== target) {
    target.click();
  }
}

export default {
  disabled: { value: false, reflect: true },
  render: () => html`
    <template layout="contents">
      <label layout="row gap:0.5 items:center" onclick="${clickSlottedElement}">
        <slot></slot>
        <ui-text type="body-s" color="gray-600">
          <slot name="label"></slot>
        </ui-text>
      </label>
    </template>
  `.css`
    :host {
      cursor: pointer;
      user-select: none;
    }

    :host([disabled]) {
      pointer-events: none;
    }

    @media (hover: hover) {
      :host(:hover) ui-text {
        color: var(--ui-color-gray-800);
      }
    }
  `,
};
