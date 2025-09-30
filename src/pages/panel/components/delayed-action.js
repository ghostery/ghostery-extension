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
  selector: 'button, a',
  timeout: {
    value: 5,
    connect: (host, key) => {
      const timeout = host[key];

      let timeoutId =
        timeout &&
        setTimeout(() => {
          host.querySelector(host.selector)?.click();
        }, timeout * 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    },
  },
  render: ({ timeout }) => html`
    <template layout="block">
      <div layout="absolute top left height:0.5"></div>
      <slot></slot>
    </template>
  `.css`
    @keyframes progress {
      from { width: 0%; }
      to { width: calc(100% + 2px); }
    }

    div {
      background: var(--color-brand-secondary);
      width: 0%;
      border-radius: 0 2px 2px 0;
      animation: progress ${timeout}s ease-in-out forwards;
    }
  `,
};
