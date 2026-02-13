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
import { themeToggle } from '/ui/theme.js';

export default {
  render: () =>
    html`
      <template layout="relative column height::100% width::359px overflow">
        <div
          id="bg"
          layout="absolute top:-250px left:50% size:1648px:1525px layer:-1"
        >
          <div id="c-1" layout="absolute left:300px top:100px size:800px"></div>
          <div
            id="c-2"
            layout="absolute left:420px top:320px size:1200px"
          ></div>
        </div>
        <header
          layout="row center padding:top:2"
          layout@1280px="absolute top:3 left:3 padding:0;"
        >
          <ui-icon name="logo-with-slogan"></ui-icon>
        </header>
        <div layout="grow row content:center padding:3:1:4">
          <div layout="column items:center grow">
            <slot></slot>
          </div>
        </div>
      </template>
    `.css`
    #bg { transform: translateX(-50%); }

    #c-1 {
      background: radial-gradient(circle, #A1E4FF 0%, rgba(255,255,255,0.1) 70%);
      opacity: 0.4;
    }

    #c-2 {
      background: radial-gradient(circle, #3751D5 0%, rgba(255,255,255,0.1) 65%);
      opacity: 0.3;
    }

    header {
      color: var(--color-brand-secondary);
    }

    @media (prefers-color-scheme: dark) {
      :host {
        background: var(--background-secondary);
      }

      #bg { display: none; }
    }
   `.use(themeToggle),
};
