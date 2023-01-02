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
  disabled: false,
  href: '',
  render: ({ disabled, href }) => html`
    <template
      layout="column content:center relative"
      layout[disabled]="height::120px"
    >
      ${disabled &&
      html`
        <section
          id="disabled"
          layout="column center gap:2 margin absolute inset layer:1"
        >
          <ui-text type="label-m" color="error-500" layout="block:center">
            <ui-icon name="warning" layout="block inline"></ui-icon><br />
            Additional Permissions Required
          </ui-text>
          <ui-text class="button" type="label-m" color="white">
            Enable Ghostery
          </ui-text>
          <a layout="absolute inset layer:3" href="${href}" target="_blank"></a>
        </section>
      `}
      <div id="content"><slot></slot></div>
    </template>
  `.css`

    :host([disabled]) {
      border: 1px dashed var(--ui-color-error-500);
      border-radius: 4px;
    }

    :host([disabled])::before {
      z-index: 1;
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      backdrop-filter: blur(1px);
      background: rgba(255, 243, 238, 0.8);
    }

    ui-text.button {
      background: #00AEF0;
      border-radius: 2px;
      padding: 8px 12px;
    }

    :host([disabled]) #content {
      z-index: 0;
    }
  `,
};
