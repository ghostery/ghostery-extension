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

function scrollTo(position) {
  return (host) => {
    host.content.scrollTo({
      left: position === 'start' ? 0 : host.content.scrollWidth,
      behavior: 'smooth',
    });
  };
}

function checkElements(host, event) {
  host.empty = event.target.assignedElements().length === 0;
}

export default {
  content: ({ render }) => render().querySelector('#content'),
  position: {
    value: '',
    connect: (host, key) => {
      const cb = host.content.addEventListener('scroll', () => {
        if (host.content.scrollLeft === 0) {
          host[key] = 'start';
        } else if (
          host.content.scrollLeft + host.content.clientWidth >=
          host.content.scrollWidth
        ) {
          host[key] = 'end';
        } else {
          host[key] = 'middle';
        }
      });

      // Check initial scroll position after content is fully-rendered
      requestAnimationFrame(() => {
        if (host.content.scrollWidth > host.content.clientWidth) {
          host[key] = 'start';
        }
      });

      return () => {
        host.content.removeEventListener('scroll', cb);
      };
    },
  },
  empty: { value: false, reflect: true },
  render: ({ position }) => html`
    <template layout="block relative">
      <div
        class="scroll prev"
        layout="row items:center padding absolute inset right:auto width:55px layer"
        hidden="${position !== 'middle' && position !== 'end'}"
        inert="${position !== 'middle' && position !== 'end'}"
      >
        <ui-button layout="size:4" onclick="${scrollTo('start')}">
          <button layout="padding:0">
            <ui-icon name="chevron-left" color="brand-primary"></ui-icon>
          </button>
        </ui-button>
      </div>
      <div id="content" layout="row padding:0.5:0 gap:0.5 overflow:scroll">
        <div layout="width:1 shrink:0"></div>
        <slot onslotchange="${checkElements}"></slot>
        <div layout="width:1 shrink:0"></div>
      </div>
      <div
        class="scroll next"
        layout="row items:center content:end padding absolute inset left:auto width:55px layer"
        hidden="${position !== 'start' && position !== 'middle'}"
        inert="${position !== 'start' && position !== 'middle'}"
      >
        <ui-button layout="size:4" onclick="${scrollTo('end')}">
          <button layout="padding:0">
            <ui-icon name="chevron-right" color="brand-primary"></ui-icon>
          </button>
        </ui-button>
      </div>
    </template>
  `.css`
    :host {
      background: var(--background-secondary);
      max-width: 100cqw;
    }

    :host([empty]) {
      display: none;
    }

    .scroll {
      transition: opacity 0.1s ease-out;
    }

    .scroll[hidden] {
      opacity: 0;
      pointer-events: none;
    }

    .scroll.prev {
      background: linear-gradient(90deg, var(--background-primary) 0%, rgba(255, 255, 255, 0.00) 100%);
    }

    .scroll.next {
      background: linear-gradient(270deg, var(--background-primary) 0%, rgba(255, 255, 255, 0.00) 100%);
    }

    #content {
      scrollbar-width: none;
      scroll-snap-type: x mandatory;
    }

    #content::-webkit-scrollbar {
      display: none;
    }

    ui-button {
      border-radius: 50%;
    }
  `,
};
