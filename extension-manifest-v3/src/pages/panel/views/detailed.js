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

import { html, define, store, router } from 'hybrids';
import { order } from '@ghostery/ui/categories';

import Stats from '/store/stats.js';

export default define({
  tag: 'panel-detailed-view',
  stats: store(Stats),
  render: ({ stats }) => html`
    <header>
      <a href="${router.backUrl()}">
        <ui-icon name="chevron-left"></ui-icon> <span>Back</span>
      </a>
      <h1>Detailed View</h1>
    </header>
    <ul>
      ${store.ready(stats) &&
      html`
        ${Object.keys(stats.byCategory)
          .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
          .map(
            (category) => html`
              <li class="category">
                <panel-category-with-trackers
                  category=${category}
                ></panel-category-with-trackers>
              </li>
            `,
          )}
      `}
    </ul>
  `.css`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      box-sizing: border-box;
      height: calc(100% + 10px);
    }

    header {
      display: flex;
      position: relative;
      margin-bottom: 20px;
      margin-top: 6px;
      align-items: center;
    }

    header h1 {
      color: var(--ui-black);
      text-align: center;
      font-weight: 600;
      font-size: 16px;
      white-space: nowrap;
      margin: 0;
      flex: 1;
    }

    header a {
      background: #FFFFFF;
      box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.05);
      border-radius: 7.4px;
      border: none;
      display: flex;
      align-items: center;
      position: absolute;
      color: var(--ui-deep-blue);
      padding: 10px 8px;
      cursor: pointer;
      text-decoration: none;
    }

    header a ui-icon {
      height: 18px;
      margin-left: -6px;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `,
});
