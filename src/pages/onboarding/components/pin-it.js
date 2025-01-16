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
  browser: { value: '', reflect: true },
  render: ({ browser }) => html`
    <template
      layout="fixed top:3 right:3 layer:1000 row items:center gap:1.5 padding:2:3:2:2"
    >
      <div id="arrow" layout="absolute top right:150px size:2.5"></div>
      <div id="icon" layout="relative layer row center size:5">
        <ui-icon
          name="extension-${browser}"
          layout="size:3"
          color="success-500"
        ></ui-icon>
      </div>
      <ui-text type="display-xs"><slot></slot></ui-text>
    </template>
  `.css`
    @keyframes shake {
      0% { transform: translateY(0); }
      50% { transform: translateY(4px); }
      100% { transform: translateY(0); }
    }

    :host {
      background: var(--ui-color-success-500);
      box-shadow: 15px 30px 80px rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      animation: shake 1s ease-in-out infinite;
      color: white;
    }

    ui-text {
      color: white;
    }

    #arrow {
      background: var(--ui-color-success-500);
      transform: rotate(45deg) translateY(-50%);
    }

    :host([browser='chrome']) #arrow { right: 85px; }
    :host([browser='edge:desktop']) { min-width: 220px;  }
    :host([browser='edge:desktop']) #arrow { right: 218px; }

    :host([browser='opera']) { top: 16px; right: 8px; }
    :host([browser='opera']) #arrow { right: 22px; }

    #icon {
      background: white;
      border-radius: 50%;
    }
  `,
};
