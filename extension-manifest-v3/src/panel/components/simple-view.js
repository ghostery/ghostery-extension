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

import { html, define, store, dispatch } from '/hybrids.js';
import "./simple-view/tracker-wheel.js";
import "./simple-view/toggle-switch.js";
import "./simple-view/page-load.js";
import { toggles } from '../../common/rulesets.js';
import { sortCategories, getCategoryName } from '../utils/categories.js';
import { t } from '../utils/i18n.js';
import { externalLink, chevronRight } from './icons.js';

function toggleDetailedView(host) {
  dispatch(host, 'toggle-detailed-view');
}

define({
  tag: "simple-view",
  settings: null,
  stats: null,
  content: ({ settings, stats }) => html`
    <main>

      <h1>${t('privacy_protection')}</h1>

      <section class="toggles">
        ${store.ready(settings) && toggles.map((toggle) => html`
          <toggle-switch toggle=${toggle} settings=${settings}></toggle-switch>
        `)}
      </section>

      <section class="stats">
        <tracker-wheel stats=${stats}></tracker-wheel>

        <ul>
          ${store.ready(stats) && sortCategories(Object.keys(stats.byCategory)).map((category) => html`
            <li class="category">
              <category-bullet category=${category} size=${7}></category-bullet>
              <label>${getCategoryName(category)}</label>
              <strong>${stats.byCategory[category].count}</strong>
            </li>
          `)}
        </ul>
      </section>

      <section class="buttons">
        <a href="https://www.whotracks.me/websites/${store.ready(stats) ? stats.domain : ''}.html" target="_blank">
          ${t('statistical_report')} ${externalLink}
        </a>
        <a onclick="${toggleDetailedView}">${t('detailed_view')} ${chevronRight}</a>
      </section>

      <page-load stats=${stats}></page-load>

    </main>
  `,
});
