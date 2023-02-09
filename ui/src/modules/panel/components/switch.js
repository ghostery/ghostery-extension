import { html, children } from 'hybrids';

import SwitchItem from './switch-item.js';

export default {
  height: {
    value: undefined,
    observe(host, value, lastValue) {
      if (lastValue) {
        host.style.height = `${lastValue}px`;
        requestAnimationFrame(() => {
          host.style.height = `${value}px`;

          host.addEventListener(
            'transitionend',
            (event) => {
              if (event.currentTarget === host) {
                host.style.height = '';
              }
            },
            { once: true },
          );
        });
      }
    },
  },
  items: children(SwitchItem),
  active: {
    get: ({ items }) => items.find((item) => item.active),
    observe(host) {
      requestAnimationFrame(() => {
        host.height = host.clientHeight;
      });
    },
  },
  render: () => html`
    <template layout="block relative overflow:x margin:-2 padding:2">
      <slot></slot>
    </template>
  `.css`
    :host {
      box-sizing: border-box;
      transition: height 500ms cubic-bezier(0.4, 0.15, 0, 1);
      will-change: height;
    }
  `,
};
