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

function close(host, event) {
  if (event.target === event.currentTarget) {
    host.shadowRoot.querySelector('a').click();
  }
}

function animateOnClose(host, event) {
  router.resolve(
    event,
    new Promise((resolve) => {
      host.dialog.addEventListener('transitionend', resolve, { once: true });
      host.dialog.close();
    }),
  );
}

export default {
  dialog: {
    get: ({ render }) => render().querySelector('dialog'),
    connect(host, key) {
      const timeout = setTimeout(() => {
        host[key].showModal();
      }, 0);
      return () => clearTimeout(timeout);
    },
  },
  render: () => html`
    <template layout="block">
      <dialog
        onclick="${close}"
        layout="
          grid::max|1
          width:full::full height:auto::auto
          margin:0 padding:0
          top:4 bottom layer:400
        "
      >
        <section
          id="header"
          layout="grid:24px|1|24px items:center padding:1.5:2"
        >
          <div layout="column items:center area:2">
            <slot name="header"></slot>
          </div>
          <ui-action>
            <a
              onclick="${animateOnClose}"
              href="${router.backUrl()}"
              layout="size:3 padding:0.5"
            >
              <ui-icon name="close"></ui-icon>
            </a>
          </ui-action>
        </section>
        <section id="content" layout="column overflow:y:auto gap:2 padding:2">
          <slot></slot>
        </section>
      </dialog>
      <div id="backdrop" layout="fixed layer:300 inset:0"></div>
    </template>
  `.css`
    dialog {
      border: none;
      border-radius: 12px 12px 0 0;
      background: var(--ui-color-white);
      overscroll-behavior: contain;
      transform: translateY(100%);
      transition: transform 500ms cubic-bezier(0.4, 0.15, 0, 1);
    }

    dialog[open] {
      transform: translateY(0);
    }

    dialog::backdrop {
      display: none;
    }

    #backdrop {
      background: var(--ui-color-gray-900);
      opacity: 0;
      transition: all 500ms ease-out;
    }

    dialog[open] + #backdrop {
      opacity: 0.7;
    }

    #header {
      border-bottom: 1px solid var(--ui-color-gray-200);
    }

    a {
      color: var(--ui-color-gray-600);
      background: var(--ui-color-gray-200);
      border-radius: 50%;
    }
  `,
};
