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

import { html, router } from 'hybrids';

function close(host) {
  host.shadowRoot.querySelector('a').click();
}

function animateOnClose(host, event) {
  router.resolve(
    event,
    new Promise((resolve) => {
      host.shadowRoot
        .querySelector('#dialog')
        .addEventListener('transitionend', resolve, { once: true });
      host.open = false;
    }),
  );
}

export default {
  open: {
    value: false,
    reflect: true,
    connect(host, key) {
      const timeout = setTimeout(() => {
        host[key] = true;
      });
      return () => clearTimeout(timeout);
    },
  },
  render: () => html`
    <template layout="block relative layer:400">
      <div id="backdrop" layout="fixed inset:0" onclick="${close}"></div>
      <div
        id="dialog"
        layout="
          grid::max|1
          width:full::full height:auto::94vh
          margin:0 padding:0
          fixed inset bottom top:auto
        "
      >
        <section
          id="header"
          layout="grid:24px|1|24px items:center padding:1.5:2 gap"
        >
          <div layout="block:center column items:center area:2/3">
            <slot name="header"></slot>
          </div>
          <ui-action>
            <a
              onclick="${animateOnClose}"
              href="${router.backUrl()}"
              layout="padding:2 margin:-2"
            >
              <div layout="row center size:3">
                <ui-icon name="close" layout="size:2"></ui-icon>
              </div>
            </a>
          </ui-action>
        </section>
        <section id="content" layout="column overflow:y:auto gap:2 padding:2">
          <slot></slot>
        </section>
      </div>
    </template>
  `.css`
    #dialog {
      border: none;
      border-radius: 12px 12px 0 0;
      background: var(--ui-color-white);
      overscroll-behavior: contain;
      transform: translateY(100%);
      transition: transform 500ms cubic-bezier(0.4, 0.15, 0, 1);
    }

    #backdrop {
      background: var(--ui-color-backdrop);
      opacity: 0;
      transition: all 500ms ease-out;
    }

    :host([open]) #dialog {
      transform: translateY(0);
    }

    :host([open]) #backdrop {
      opacity: 0.7;
    }

    #header {
      border-bottom: 1px solid var(--ui-color-gray-200);
    }

    a > div {
      color: var(--ui-color-gray-600);
      background: var(--ui-color-gray-200);
      border-radius: 50%;
    }
  `,
};
