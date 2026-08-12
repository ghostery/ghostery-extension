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

import { categories } from '/ui/labels.js';

export default {
  name: '',
  category: '',
  href: '',
  render: ({ name, category, href }) => html`
    <template layout="column">
      <ui-action>
        <a
          href="${href}"
          target="_blank"
          rel="noreferrer"
          layout="grow column gap:3 padding:3 relative"
        >
          <ui-category-icon name="${category}" layout="size:5 padding:0.833"></ui-category-icon>
          <div layout="column gap:0.5 width:full">
            <ui-text type="display-s" ellipsis>${name}</ui-text>
            <ui-text type="label-l" color="secondary">${categories[category]}</ui-text>
          </div>
          <ui-icon name="arrow-up-right" layout="absolute top:3 right:3 size:3"></ui-icon>
        </a>
      </ui-action>
    </template>
  `.css`
    :host {
      background: var(--background-primary);
      border: 1px solid var(--border-primary);
      border-radius: 24px;
      box-shadow: 0px 4px 6px 0px var(--shadow-card);
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    ui-icon {
      color: var(--color-tertiary);
    }
  `,
};
