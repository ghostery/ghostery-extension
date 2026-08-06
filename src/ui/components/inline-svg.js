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

const cache = new Map();

function fetchSVG(src) {
  let template = cache.get(src);

  if (!template) {
    template = fetch(src)
      .then((res) => res.text())
      .then((markup) => html([markup]))
      .catch(() => '');

    cache.set(src, template);
  }

  return template;
}

export default {
  src: '',
  render: ({ src }) => html`
    <template layout="block">${src && html.resolve(fetchSVG(src))}</template>
  `.css`
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
};
