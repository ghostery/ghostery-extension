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
  value: '',
  label: '',
  render: ({ value, label }) => html`
    <template layout="column gap:0.5 padding:0.5">
      <div id="card" layout="row center gap:4 padding:3:3:3:0">
        <div layout="relative">
          <ui-icon name="logo" layout="block size:5"></ui-icon>
          <div id="badge" layout="absolute top:3 left:3 row center size:4">
            <ui-icon name="search" layout="size:2"></ui-icon>
          </div>
        </div>
        <div layout="column">
          <ui-text type="headline-l">${value}</ui-text>
          <ui-text type="label-m">${label}</ui-text>
        </div>
      </div>
      <div layout="row center gap:2 padding:1:0">
        <slot></slot>
      </div>
    </template>
  `.css`
    :host {
      background: var(--background-secondary);
      border-radius: 12px;
    }

    #card {
      background: var(--background-primary);
      border-radius: 8px;
      box-shadow: 0px 3px 4px var(--shadow-button);
    }

    #badge {
      box-sizing: border-box;
      background: var(--background-wtm-strong);
      border: 2px solid var(--background-primary);
      border-radius: 50%;
      color: var(--color-onbrand);
    }
  `,
};
