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
  inContent: { value: false, reflect: true },
  render: () => html`
    <template
      layout="column gap:3 padding:3"
      layout[in-content]="padding:2"
      layout@768px="row items:center"
    >
      <slot name="picture"></slot>
      <div layout="column gap:2 grow"><slot></slot></div>
    </template>
  `.css`
    :host {
      background: var(--background-primary);
      border: 1px solid var(--border-primary);
      border-radius: 8px;
      box-shadow: 0px 4px 8px var(--shadow-card);
    }

    :host([in-content]) {
      background: var(--background-secondary);
      border: none;
      box-shadow: none;
    }
  `,
};
