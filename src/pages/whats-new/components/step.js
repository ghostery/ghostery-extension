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
  image: '',
  step: '',
  name: '',
  description: '',
  // Renders the compact variant used by the closing "repeat" hint
  compact: { value: false, reflect: true },
  render: ({ image, step, name, description, compact }) => html`
    <template layout="column center gap:2 padding:3">
      <ui-inline-svg src="${image}" layout="size:20"></ui-inline-svg>
      ${
        compact
          ? html`<ui-text type="label-l" layout="block:center">${name}</ui-text>`
          : html`
              <div layout="column center gap:0.5">
                <ui-text type="label-s" color="tertiary" uppercase>${step}</ui-text>
                <ui-text type="display-s" layout="block:center">${name}</ui-text>
              </div>
              <ui-text type="body-m" color="secondary" layout="block:center">
                ${description}
              </ui-text>
            `
      }
    </template>
  `.css`
    :host {
      background: var(--background-primary);
      border: 1px solid var(--border-primary);
      border-radius: 24px;
      box-shadow: 0px 4px 12px 0px var(--shadow-card);
    }

    :host([compact]) {
      background: var(--background-wtm-primary);
      border: none;
      box-shadow: none;
      padding: 16px;
      justify-content: center;
    }

    :host([compact]) ui-inline-svg {
      width: 80px;
      height: 80px;
    }
  `,
};
