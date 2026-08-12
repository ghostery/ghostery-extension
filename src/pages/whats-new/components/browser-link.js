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

export default {
  name: '',
  icon: '',
  href: '',
  render: ({ name, icon, href }) => html`
    <template layout="contents">
      <ui-action>
        <a
          href="${href}"
          title="${name}"
          target="_blank"
          rel="noreferrer"
          layout="row center size:6"
        >
          <img src="${icon}" alt="${name}" layout="size:4" />
        </a>
      </ui-action>
    </template>
  `.css`
    a {
      background: var(--background-primary);
      border: 1px solid var(--background-tertiary);
      border-radius: 24px;
    }
  `,
};
