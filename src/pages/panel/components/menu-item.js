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

import { openTabWithUrl } from '/utils/tabs.js';

export default {
  href: '',
  icon: '',
  suffixIcon: 'arrow-right',
  render: ({ href, icon, suffixIcon }) => html`
    <template layout="contents">
      <ui-action>
        <a
          href="${href}"
          layout="grid:max|1|max items:center:start gap:1.5 padding margin:0:1"
          layout@390px="padding:1.5:1"
          onclick="${openTabWithUrl}"
        >
          <ui-icon name="${icon}" color="gray-600"></ui-icon>
          <ui-text
            type="label-m"
            ellipsis
            layout="column width::0:full"
            color="inherit"
          >
            <slot></slot>
          </ui-text>
          <ui-icon name="${suffixIcon}" color="gray-400"></ui-icon>
        </a>
      </ui-action>
    </template>
  `.css`
    a {
      color: var(--ui-color-gray-800);
    }

    ui-icon {
      transition: color 0.2s;
    }

    @media (hover: hover) {
      a:hover, a:hover ui-icon {
        color: var(--ui-color-primary-700);
      }
    }
  `,
};
