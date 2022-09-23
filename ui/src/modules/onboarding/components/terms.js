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

import { define, html } from 'hybrids';

export default define({
  tag: 'ui-onboarding-terms',
  render: () => html`<slot></slot>`.css`
    ::slotted(a) {
      color: inherit;
      font-weight: 500;
      text-decoration: none;
      white-space: nowrap;
      color: var(--ui-color-gray-800);
    }

    ::slotted(a:hover) {
      color: var(--ui-color-primary-500);
    }

    ::slotted(a):after {
      display: inline-block;
      content: '';
      width: 16px;
      height: 16px;
      margin-left: 2px;
      background-color: var(--ui-color-gray-800);
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M4.11101 2.17971C5.26216 1.41054 6.61553 1 8 1C8.91926 1 9.82951 1.18106 10.6788 1.53284C11.5281 1.88463 12.2997 2.40024 12.9497 3.05025C13.5998 3.70026 14.1154 4.47194 14.4672 5.32121C14.8189 6.17049 15 7.08075 15 8C15 9.38447 14.5895 10.7378 13.8203 11.889C13.0511 13.0401 11.9579 13.9373 10.6788 14.4672C9.3997 14.997 7.99224 15.1356 6.63437 14.8655C5.2765 14.5954 4.02922 13.9287 3.05026 12.9497C2.07129 11.9708 1.4046 10.7235 1.13451 9.36563C0.86441 8.00776 1.00303 6.6003 1.53285 5.32121C2.06266 4.04213 2.95987 2.94888 4.11101 2.17971ZM8 6C8.55228 6 9 5.55228 9 5C9 4.44772 8.55228 4 8 4C7.44772 4 7 4.44772 7 5C7 5.55228 7.44772 6 8 6ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11V8Z' fill='black'/%3E%3C/svg%3E%0A");
      mask-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M4.11101 2.17971C5.26216 1.41054 6.61553 1 8 1C8.91926 1 9.82951 1.18106 10.6788 1.53284C11.5281 1.88463 12.2997 2.40024 12.9497 3.05025C13.5998 3.70026 14.1154 4.47194 14.4672 5.32121C14.8189 6.17049 15 7.08075 15 8C15 9.38447 14.5895 10.7378 13.8203 11.889C13.0511 13.0401 11.9579 13.9373 10.6788 14.4672C9.3997 14.997 7.99224 15.1356 6.63437 14.8655C5.2765 14.5954 4.02922 13.9287 3.05026 12.9497C2.07129 11.9708 1.4046 10.7235 1.13451 9.36563C0.86441 8.00776 1.00303 6.6003 1.53285 5.32121C2.06266 4.04213 2.95987 2.94888 4.11101 2.17971ZM8 6C8.55228 6 9 5.55228 9 5C9 4.44772 8.55228 4 8 4C7.44772 4 7 4.44772 7 5C7 5.55228 7.44772 6 8 6ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11V8Z' fill='black'/%3E%3C/svg%3E%0A");
    }

    ::slotted(a:hover):after {
      background-color: var(--ui-color-primary-500);
    }
  `,
});
