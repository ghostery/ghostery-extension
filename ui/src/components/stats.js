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

import { html, define } from '/hybrids.js';

import { order, labels } from '../utils/categories.js';

import './tracker-wheel.js';
import './category-bullet.js';

export default define({
  tag: 'ui-stats',
  categories: undefined,
  entries: ({ categories }) => {
    return Object.entries(
      (categories || []).reduce(
        (all, current) => ({
          ...all,
          [current]: (all[current] || 0) + 1,
        }),
        {},
      ),
    ).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  },
  render: ({ categories, entries }) => html`
    <ui-tracker-wheel categories="${categories}"></ui-tracker-wheel>

    <ul>
      ${entries.map(
        ([category, value]) => html`
          <li class="category">
            <ui-category-bullet
              category="${category}"
              size="7"
            ></ui-category-bullet>
            <span>${labels[category]}</span>
            <strong>${value}</strong>
          </li>
        `,
      )}
    </ul>
  `.css`
     :host {
       display: grid;
       grid-template-columns: 1fr 1fr;
       column-gap: 10px;
       padding: 10px 0px;
     }
 
     ul {
       display: flex;
       flex-direction: column;
       justify-content: center;
       margin: 0;
       padding: 0;
       list-style-type: none;
       list-style: none none inside;
     }
 
     .category {
       display: grid;
       grid-template-columns: min-content max-content 1fr;
       grid-gap: 5px;
       margin-bottom: 5px;
     }
 
     .category span {
       font-size: 13px;
       line-height: 16px;
     }
 
     .category strong {
       color: var(--ui-black);
       font-size: 13px;
       font-weight: 500;
       line-height: 16px;
     }
    `,
});
