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

const slide = {
  keyframes: { transform: ['translateY(100%)', 'translateY(0)'] },
  options: {
    duration: 200,
    easing: 'ease-out',
    fill: 'forwards',
  },
};

const fade = {
  keyframes: { opacity: [0, 1] },
  options: {
    duration: 200,
    easing: 'ease-out',
    fill: 'forwards',
    pseudoElement: '::backdrop',
  },
};

function close(host, event) {
  if (event.target === event.currentTarget) {
    const closeBtn = host.shadowRoot.querySelector('#close');
    closeBtn?.shadowRoot.querySelector('a').click();
  }
}

function animateOnClose(host, event) {
  router.resolve(
    event,
    new Promise((resolve) => {
      host.dialog.animate(fade.keyframes, {
        ...fade.options,
        direction: 'reverse',
      });

      host.dialog
        .animate(slide.keyframes, {
          ...slide.options,
          direction: 'reverse',
        })
        .addEventListener('finish', resolve);
    }),
  );
}

export default {
  dialog: {
    get: ({ render }) => render().querySelector('dialog'),
    observe(host, el) {
      el.showModal();
      el.animate(slide.keyframes, slide.options);
      el.animate(fade.keyframes, fade.options);
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
          top:6 bottom
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
              id="close"
              onclick="${animateOnClose}"
              href="${router.backUrl()}"
              layout="size:3 padding:0.5"
            >
              <ui-icon name="close"></ui-icon>
            </a>
          </ui-action>
        </section>
        <section id="content" layout="column overflow:scroll gap:2 padding:2">
          <slot></slot>
        </section>
      </dialog>
    </template>
  `.css`
    dialog {
      border: none;
      border-radius: 12px 12px 0 0;
      background: var(--ui-color-white);
      overscroll-behavior: contain;
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1 }
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.4);
    }

    #header {
      border-bottom: 1px solid var(--ui-color-gray-200);
    }

    #close  {
      color: var(--ui-color-gray-600);
      background: var(--ui-color-gray-200);
      border-radius: 50%;
    }
  `,
};
