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
  limit: 10,
  page: {
    value: 1,
    observe: (host, value, lastValue) => {
      Array.from(host.children).forEach((child, index) => {
        child.classList.toggle(
          'ui-pagination-active',
          index >= host.limit * (value - 1) && index < host.limit * value,
        );
      });

      if (lastValue) {
        host.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    },
  },
  render: ({ limit, page, children }) => {
    const pageCount = Math.ceil(children.length / limit);

    return html`
      <template layout="relative">
        <slot onslotchange="${html.set('page', undefined)}"></slot>
        ${pageCount > 1 &&
        html`
          <div layout="row gap center area:1/-1 margin:2">
            <ui-button
              onclick="${html.set('page', page - 1)}"
              disabled="${page <= 1}"
            >
              <button>
                <ui-icon name="chevron-left-s" color="secondary"></ui-icon>
              </button>
            </ui-button>

            ${page !== 1 &&
            html`<ui-button onclick="${html.set('page', 1)}">
              <button>
                <ui-text type="label-m" color="secondary">1</ui-text>
              </button>
            </ui-button>`}
            ${page > 3 &&
            html`<ui-text type="label-m" color="secondary">...</ui-text>`}
            ${page > 2 &&
            html`<ui-button onclick="${html.set('page', page - 1)}">
              <button>
                <ui-text type="label-m" color="secondary">${page - 1}</ui-text>
              </button>
            </ui-button>`}

            <ui-button disabled>
              <button>
                <ui-text type="label-m" color="secondary">${page}</ui-text>
              </button>
            </ui-button>

            ${page < pageCount - 1 &&
            html`<ui-button onclick="${html.set('page', page + 1)}">
              <button>
                <ui-text type="label-m" color="secondary">${page + 1}</ui-text>
              </button>
            </ui-button>`}
            ${page < pageCount - 2 &&
            html`<ui-text type="label-m" color="secondary">...</ui-text>`}
            ${page !== pageCount &&
            html`<ui-button onclick="${html.set('page', pageCount)}">
              <button>
                <ui-text type="label-m" color="secondary">${pageCount}</ui-text>
              </button>
            </ui-button>`}

            <ui-button
              onclick="${html.set('page', page + 1)}"
              disabled="${page >= pageCount}"
            >
              <button>
                <ui-icon name="chevron-right-s" color="secondary"></ui-icon>
              </button>
            </ui-button>
          </div>
        `}
      </template>
    `.css`
      ::slotted(*) {
        display: none;
      }

      ::slotted(.ui-pagination-active) {
        display: block;
      }

      ui-button {
        width: 24px;
        height: 24px;
      }

      ui-button[disabled] {
        background: var(--background-secondary);
        border: none;
        box-shadow: none;
      }

      button {
        padding: 0;
      }
    `;
  },
};
