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

export default define({
  tag: 'ui-card',
  type: '',
  render: ({ type }) => html`
    <template layout="column">
      <div
        class="${{ [type]: type }}"
        layout="margin:3"
        layout@768px="margin:5"
        layout.narrow="margin:left:3 margin:right:3"
        layout.highlight="margin:2"
        layout.highlight@768px="margin:3"
      >
        <div id="illustration" layout="row content:center">
          <slot name="illustration"></slot>
        </div>
        <slot></slot>
      </div>
    </template>
  `.css`
     :host {
       background: var(--ui-color-white);
       border-radius: 16px;
       box-shadow: 15px 30px 80px rgba(0, 0, 0, 0.15);
       border: 1px solid var(--ui-color-gray-200);
     }
 
     :host([type="transparent"]) {
       background: none;
       box-shadow: none;
       border: none;
     }
 
     :host([type="highlight"]) {
       background: var(--ui-color-gray-100);
       border-radius: 8px;
       border: none;
       box-shadow: none;
     }
 
     #illustration ::slotted(*) {
       margin-bottom: 24px;
     }
   `,
});
