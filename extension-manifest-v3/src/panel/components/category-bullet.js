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

define({
  tag: "category-bullet",
  category: "unknown",
  size: 0,
  render: ({ category, size }) => {
    const sizePx = `${size}px`;
    return html`
      <label
        class="category-bullet"
        style=${{
          width: sizePx,
          height: sizePx,
          backgroundColor: CATEGORY_COLORS[category],
          borderRadius: sizePx,
          display: 'inline-block',
        }}
      ></label>
    `;
  },
});
