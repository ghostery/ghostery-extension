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

import { dispatch, html } from 'hybrids';

function updateValue(value) {
  return (host) => {
    if (host.value !== value) {
      host.value = value;
      dispatch(host, 'change', { detail: value });
    }
  };
}

export default {
  value: false,
  responsive: false,
  render: ({ value, responsive }) => html`
    <template layout="row relative">
      <ui-action-button-group
        class="${{ responsive }}"
        layout.responsive="column"
        layout.responsive@768px="row"
      >
        <ui-action-button grouped active="${value}">
          <button
            layout="row relative gap:0.5 padding:0.5"
            onclick="${updateValue(true)}"
          >
            <ui-icon name="block-s"></ui-icon>
            <ui-text type="label-xs" color="inherit">Blocked</ui-text>
          </button>
        </ui-action-button>
        <ui-action-button class="trusted" grouped active="${!value}">
          <button
            layout="row gap:0.5 padding:0.5"
            onclick="${updateValue(false)}"
          >
            <ui-icon name="trust-s"></ui-icon>
            <ui-text type="label-xs" color="inherit">Trusted</ui-text>
          </button>
        </ui-action-button>
      </ui-action-button-group>
    </template>
  `.css`
    ui-action-button {
      width: auto;
      height: 28px;
      color: var(--ui-color-gray-600);
    }

    ui-action-button[active] {
      color: var(--ui-color-gray-800);
    }
  `,
};
