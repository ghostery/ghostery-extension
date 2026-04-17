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
  icon: '',
  render: ({ icon }) => html`
    <template layout="block">
      <settings-card static layout="padding:0">
        <div id="content" layout="column gap:2 grow self:stretch padding:2">
          ${icon
            ? html`
                <div id="icon" layout="row center padding self:start">
                  <ui-icon name="${icon}" color="brand-primary" layout="size:3"></ui-icon>
                </div>
              `
            : html`<slot name="icon"></slot>`}

          <div layout="row gap:2 items:start grow">
            <div layout="column gap:0.5 grow items:start grow self:center">
              <ui-text id="name" type="headline-s"><slot></slot></ui-text>
              <slot name="description"></slot>
              <slot name="footer"></slot>
            </div>
            <slot name="action"></slot>
          </div>
        </div>
        <slot name="card-footer"></slot>
      </settings-card>
    </template>
  `.css`
    settings-card {
      container-type: inline-size;
    }

    #icon {
      background: var(--background-brand-primary);
      border-radius: 12px;
    }

    slot[name='description']::slotted(*) {
      display: block;
      color: var(--color-tertiary);
      font: var(--font-body-m);
    }

    slot[name='card-footer']::slotted(*) {
      padding: 16px;
      border-top: 1px solid var(--border-primary);
    }

    @container (width > 500px) {
      #content {
        flex-direction: row;
      }
    }
  `,
};
