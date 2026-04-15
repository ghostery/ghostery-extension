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

export default {
  icon: '',
  value: {
    value: false,
    observe: (host, value, lastValue) => {
      if (lastValue !== undefined) dispatch(host, 'change', { value });
    },
  },
  render: ({ icon, value }) => html`
    <template layout="grid">
      <settings-card layout="padding:0">
        <ui-toggle value="${value}" onchange="${html.set('value')}" layout="grow">
          <div id="content" layout="row gap:2 grow self:stretch">
            ${icon
              ? html`
                  <div id="icon" layout="row center padding self:start">
                    <ui-icon name="${icon}" color="brand-primary" layout="size:3"></ui-icon>
                  </div>
                `
              : html`<slot name="icon"></slot>`}

            <div layout="column gap:0.5 grow items:start">
              <ui-text id="name" type="headline-s"><slot></slot></ui-text>
              <ui-text id="description" color="tertiary">
                <slot name="description"></slot>
              </ui-text>
              <slot name="footer"></slot>
            </div>
          </div>
        </ui-toggle>
        <slot name="card-footer"></slot>
      </settings-card>
    </template>
  `.css`
    settings-card {
      container-type: inline-size;
    }

    ui-toggle::part(container) {
      padding: 16px;
      margin: 0;
    }

    #icon {
      background: var(--background-brand-primary);
      border-radius: 12px;
    }

    #description slot::slotted(a) {
      font: var(--font-label-m);
      color: var(--color-primary);
      text-decoration: underline;
    }

    slot[name='card-footer']::slotted(*) {
      padding: 20px 32px;
      border-top: 1px solid var(--border-primary);
    }

    @container (width < 500px) {
      #content {
        flex-direction: column;
        margin-right: -100px;
      }

      ui-toggle::part(toggle) {
        margin-top: 6px;
      }
    }

    @container (width < 750px) {
      slot[name='card-footer']::slotted(*) {
        padding: 16px;
      }
    }

    @media (hover: hover) {
      :host(:hover) #name {
        text-decoration: underline;
      }
    }
  `,
};
