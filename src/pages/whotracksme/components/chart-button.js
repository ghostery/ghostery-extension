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
  active: { value: false, reflect: true },
  render: () => html`
    <template layout="contents">
      <ui-button>
        <button layout="column center gap:0"><slot></slot></button>
      </ui-button>
    </template>
  `.css`
    ui-button {
      box-shadow: none;
      border-radius: 0px;
      height: 50px;
      background: var(--background-secondary);
      border-color: var(--border-primary);
    }

    :host(:first-child) ui-button {
      border-radius: 8px 0 0 8px;
      border-right: none;
    }

    :host(:last-child) ui-button {
      border-radius: 0 8px 8px 0;
      border-left: none;
    }

    :host([active]) ui-button {
      background: var(--background-primary);
    }
  `,
};
