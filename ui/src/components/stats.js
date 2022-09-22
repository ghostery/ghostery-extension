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

import { html, define } from 'hybrids';

import { sortCategories } from '../utils/categories.js';

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
    ).sort(sortCategories((a) => a[0]));
  },
  content: ({ categories, entries }) => html`
    <template layout="row items:center gap margin:2:0">
      <ui-tracker-wheel categories="${categories}"></ui-tracker-wheel>

      <section layout="grow column gap:0.5 items:start">
        ${entries.map(
          ([category, value]) => html`
            <ui-category
              name="${category}"
              bullet="7"
              count="${value}"
            ></ui-category>
          `,
        )}
      </section>
    </template>
  `,
});
