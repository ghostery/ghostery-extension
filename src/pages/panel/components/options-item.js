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

import { html, msg } from 'hybrids';

export default {
  icon: '',
  enabled: false,
  terms: false,
  render: ({ icon, enabled, terms }) => html`
    <template layout="row gap items:center padding:1:1.5">
      ${icon && html`<ui-icon name="${icon}" layout="margin:right"></ui-icon>`}
      <ui-text type="body-s" layout="grow">
        <slot></slot>
      </ui-text>
      <ui-text
        type="label-s"
        color="${terms && enabled ? 'primary' : 'danger-primary'}"
        ellipsis
        layout="shrink:0"
      >
        ${terms
          ? enabled
            ? msg`Enabled`
            : msg`Disabled`
          : msg`Permission required`}
      </ui-text>
    </template>
  `.css`
    :host {
      background: var(--background-primary);
      border: 1px solid var(--border-primary);
    }

    :host(:first-of-type) {
      border-radius: 8px 8px 0 0;
    }

    :host(:last-of-type) {
      border-radius: 0 0 8px 8px;
    }

    :host(:not(:last-of-type)) {
      border-bottom: none;
    }

    ui-icon {
      color: var(--color-secondary);
    }

    @media (hover: hover) {
      :host(:hover) {
        background: var(--background-brand-primary);
      }

      :host(:hover) ui-icon {
        color: var(--color-brand-primary);
      }

      :host(:hover) ui-text {
        color: var(--color-brand-primary);
      }
    }
  `,
};
