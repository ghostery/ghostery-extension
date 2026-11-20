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

function scrollPage(direction) {
  return ({ content, edge }) => {
    // Cards hidden under the faded edge on one side become fully visible on the other
    content.scrollBy({ left: direction * (content.clientWidth - 2 * edge.offsetWidth) });
  };
}

export default {
  content: ({ render }) => render().querySelector('#content'),
  edge: ({ render }) => render().querySelector('.scroll'),
  position: {
    value: '',
    connect: (host, key) => {
      const { content } = host;

      // Compares the cards with the visible area instead of using the scroll offsets,
      // as the side padding can make the row scrollable while all cards are visible
      const update = () => {
        const bounds = content.getBoundingClientRect();
        const cards = content.firstElementChild.getBoundingClientRect();

        const hasPrev = cards.left < bounds.left - 1;
        const hasNext = cards.right > bounds.right + 1;

        if (hasPrev && hasNext) {
          host[key] = 'middle';
        } else if (hasPrev) {
          host[key] = 'end';
        } else if (hasNext) {
          host[key] = 'start';
        } else {
          host[key] = '';
        }
      };

      // The cards render after connect, and the window can be resized
      const observer = new ResizeObserver(update);
      observer.observe(content);
      observer.observe(content.firstElementChild);

      content.addEventListener('scroll', update, { passive: true });

      return () => {
        observer.disconnect();
        content.removeEventListener('scroll', update);
      };
    },
  },
  render: ({ position }) => html`
    <template layout="block relative">
      <div id="content" layout="row overflow:x:auto">
        <div layout="row items:center gap shrink:0">
          <slot></slot>
        </div>
      </div>
      <div
        class="scroll prev"
        layout="row items:center padding:2 absolute inset right:auto width:12"
        hidden="${position !== 'middle' && position !== 'end'}"
        inert="${position !== 'middle' && position !== 'end'}"
        aria-hidden="true"
      >
        <ui-button layout="size:5" onclick="${scrollPage(-1)}">
          <button tabindex="-1" layout="padding:0">
            <ui-icon name="chevron-left"></ui-icon>
          </button>
        </ui-button>
      </div>
      <div
        class="scroll next"
        layout="row items:center content:end padding:2 absolute inset left:auto width:12"
        hidden="${position !== 'start' && position !== 'middle'}"
        inert="${position !== 'start' && position !== 'middle'}"
        aria-hidden="true"
      >
        <ui-button layout="size:5" onclick="${scrollPage(1)}">
          <button tabindex="-1" layout="padding:0">
            <ui-icon name="chevron-right"></ui-icon>
          </button>
        </ui-button>
      </div>
    </template>
  `.css`
    #content {
      /* The row is full-bleed, but starts where the content of the centered 1200px column does */
      padding-left: max(16px, (100% - 1200px) / 2 + 16px);
      padding-right: max(16px, (100% - 1200px) / 2 + 16px);
      scrollbar-width: none;
    }

    #content::-webkit-scrollbar {
      display: none;
    }

    @media (prefers-reduced-motion: no-preference) {
      #content {
        scroll-behavior: smooth;
      }
    }

    .scroll {
      transition: opacity 0.1s ease-out;
    }

    .scroll[hidden] {
      opacity: 0;
      pointer-events: none;
    }

    .scroll.prev {
      background: linear-gradient(90deg, var(--background-primary), transparent);
    }

    .scroll.next {
      background: linear-gradient(270deg, var(--background-primary), transparent);
    }

    ui-button {
      border-radius: 50%;
    }

    /* Touch devices scroll the row with a swipe */
    @media (hover: none) {
      .scroll {
        visibility: hidden;
      }
    }
  `,
};
