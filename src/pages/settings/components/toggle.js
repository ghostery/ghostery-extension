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
  icon: { value: '', reflect: true },
  value: {
    value: false,
    observe: (host, value, lastValue) => {
      if (lastValue !== undefined) dispatch(host, 'change', { value });
    },
  },
  render: ({ icon, value }) => html`
    <template layout="grid">
      <settings-card layout="column padding:0">
        <ui-toggle value="${value}" onchange="${html.set('value')}" layout="grow">
          <div id="content" layout="column gap:2 grow self:stretch margin:right:-100px">
            ${icon
              ? html`
                  <div id="icon" layout="row center padding self:start">
                    <ui-icon name="${icon}" color="brand-primary" layout="size:3"></ui-icon>
                  </div>
                `
              : html`<slot name="icon"></slot>`}

            <div layout="column gap:0.5 grow items:start content:center">
              <ui-text id="name" type="headline-s"><slot></slot></ui-text>
              <slot name="description"></slot>
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

    :host([icon]) ui-toggle::part(toggle) {
      margin-top: 6px;
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
        align-items: center;
        margin-right: 0px;
      }

      ui-toggle::part(toggle) {
        margin-top: 0px;
      }
    }

    @media (hover: hover) {
      :host(:hover) #name {
        text-decoration: underline;
      }
    }
  `,
};
