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
import './tracker-wheel.js';
import { sortCategories, getCategoryName } from '../../../common/categories.js';

define({
  tag: 'wtm-stats',
  categories: [],
  byCategory: ({ categories }) => {
    return categories.reduce(
      (all, current) => ({
        ...all,
        [current]: (all[current] || 0) + 1,
      }),
      {},
    );
  },
  render: ({ categories, byCategory }) => html`
    <tracker-wheel categories=${categories}></tracker-wheel>

    <ul>
      ${sortCategories(Object.keys(byCategory)).map(
        (category) => html`
          <li class="category">
            <category-bullet category=${category} size=${7}></category-bullet>
            <label>${getCategoryName(category)}</label>
            <strong>${byCategory[category]}</strong>
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
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-bottom: 5px;
    }

    .category label {
      margin: 0 5px;
      font-size: 13px;
      line-height: 16px;
    }

    .category strong {
      color: var(--black);
      font-size: 13px;
      font-weight: 500;
      line-height: 16px;
    }
  `,
});
