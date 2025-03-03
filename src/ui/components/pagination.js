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

function updatePage(host) {
  Array.from(host.children).forEach((child, index) => {
    child.classList.toggle(
      'ui-pagination-active',
      index >= host.limit * (host.page - 1) && index < host.limit * host.page,
    );
  });
}

function reset(host) {
  host.pageCount = undefined;
  host.page = 1;
  updatePage(host);
}

export default {
  limit: 10,
  page: {
    value: 1,
    observe: (host, value, lastValue) => {
      updatePage(host);

      if (lastValue) {
        host.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    },
  },
  pageCount: (host, value) =>
    value || Math.ceil(host.children.length / host.limit),
  render: ({ page, pageCount }) => html`
    <template layout="relative padding:bottom:8">
      <slot onslotchange="${reset}"></slot>
      ${pageCount > 1 &&
      html`
        <div layout="absolute bottom left right row gap center padding:2">
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
    ::slotted(*:not(.ui-pagination-active)) {
      display: none;
    }

    ui-button {
      width: 28px;
      height: 28px;
    }

    ui-button[disabled] {
      background: var(--background-secondary);
      border: none;
      box-shadow: none;
    }

    button {
      padding: 0;
    }
  `,
};
