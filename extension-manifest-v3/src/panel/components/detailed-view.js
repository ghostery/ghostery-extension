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

import { html, define, dispatch, store } from '/hybrids.js';
import './detailed-view/category-with-trackers.js';
import { sortCategories } from '../../common/categories.js';
import { t } from '../../common/i18n.js';
import { chevronLeft } from '../../ui/icons.js';

function toggleDetailedView(host) {
  dispatch(host, 'toggle-detailed-view');
}

define({
  tag: "detailed-view",
  stats: null,
  render: ({ stats }) => html`
    <div class="wrapper">
      <header>
        <button onclick="${toggleDetailedView}">${chevronLeft} ${t('back')}</button>
        <h1>${t('detailed_view')}</h1>
        <div></div>
      </header>
      <main>
        <ul>
          ${store.ready(stats) && html`
            ${sortCategories(Object.keys(stats.byCategory)).map(category => html`
              <li class="category">
                <category-with-trackers category=${category} stats=${stats}></category-with-trackers>
              </li>
            `)}
          `}
        </ul>
      </main>
    </div>

  `.css`
    .wrapper {
      display: flex;
      flex: 1;
      flex-direction: column;
      box-sizing: border-box;
      height: calc(100% + 10px);
    }
    h1 {
      color: var(--black);
    }
    header {
      display: flex;
      position: relative;
      margin-bottom: 20px;
      margin-top: 7px;
      align-items: center;
    }

    header h1 {
      text-align: center;
      font-weight: 600;
      font-size: 20px;
      line-height: 24px;
      margin: 0;
      flex: 1;
    }

    header button {
      background: #FFFFFF;
      box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.05);
      border-radius: 7.4px;
      border: none;
      display: flex;
      align-items: center;
      position: absolute;
      color: var(--deep-blue);
      padding: 10px 8px;
      cursor: pointer;
    }

    header button svg {
      height: 18px;
      margin-left: -6px;
    }

    main {
      overflow: scroll;
      width: 100%;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `,
});
