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
  icon: '',
  static: { value: false, reflect: true },
  render: ({ icon }) => html`
    <template layout="row gap grow">
      ${icon && html`<ui-icon name="${icon}" color="quaternary" layout="size:3"></ui-icon>`}

      <div layout="column gap:0.5 grow">
        <ui-text id="name" type="headline-xs"><slot></slot></ui-text>
        <ui-text type="body-m" mobile-type="body-s" color="secondary">
          <slot name="description"></slot>
        </ui-text>
        <slot name="footer"></slot>
      </div>
    </template>
  `.css`
    @media (hover: hover) {
      :host(:hover:not([static])) #name {
        text-decoration: underline;
      }
    }
  `,
};
