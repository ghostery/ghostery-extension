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

import { getCategoryBgColor, getCategoryKey } from '../categories.js';
import * as labels from '../labels.js';

export default {
  name: '',
  count: 0,
  actionable: { value: false, reflect: true },
  large: { value: false, reflect: true },
  render: ({ name, count, large }) => html`
    <template layout="row gap items:center">
      <div id="pill" layout="size:12px:6px"></div>
      <div
        id="label"
        class="${{ large }}"
        layout="row gap items:center grow padding:0.5:0"
        layout.large="padding:1:0"
      >
        <ui-text
          type="body-${large ? 'm' : 's'}"
          color="secondary"
          layout="grow"
        >
          ${labels.categories[getCategoryKey(name)]}
        </ui-text>
        <ui-text type="label-${large ? 'm' : 's'}" id="count">${count}</ui-text>
      </div>
    </template>
  `.css`
    #pill {
      background: ${getCategoryBgColor(name)};
      border-radius: 3px;
    }

    #count {
      font-weight: 600;
    }

    #label {
      border-bottom: 1px solid var(--border-primary);
    }

    :host(:last-child) #label {
      border-bottom: none;
    }

    @media (hover: hover) {
      :host([actionable]) {
        cursor: pointer;
      }
    }
  `,
};
