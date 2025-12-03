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
  checked: { value: false, reflect: true },
  render: () =>
    html`
      <template
        layout="relative block:center column items:center content:space-between gap padding:1.5"
        layout@768px="gap:2"
      >
        <slot></slot>
        <slot name="footer"></slot>
      </template>
    `.css`
      :host {
        background: var(--background-primary);
        border-radius: 8px;
        border: 1px solid var(--border-primary);
        box-shadow: 0 3px 8px 0 var(--shadow-button);
      }

      ::slotted(*) {
        position: relative;
        pointer-events: none;
      }

      ::slotted(input[type="radio"]) {
        pointer-events: auto;
        appearance: none;
        -webkit-appearance: none;
        display: block;
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        background: transparent;
        border-radius: 8px;
      }

      ::slotted(input[type="radio"]:focus-visible) {
        outline: 2px solid var(--border-brand-solid);
        outline-offset: 3px;
      }

      ::slotted(input[type="radio"]:checked) {
        background: var(--background-brand-primary);
        border: 2px solid var(--background-brand-solid);
      }

      ::slotted(input[type="radio"]:checked)::after {
        z-index: 1;
        content: '';
        position: absolute;
        right: 4px;
        top: 4px;
        width: 24px;
        height: 24px;
        background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_4274_37805)'%3E%3Cpath d='M6.11523 1.07422C9.99501 0.6413 14.0041 0.642323 17.8838 1.0752L17.8848 1.07422C20.487 1.36468 22.5947 3.41102 22.9023 6.03613C23.3665 9.99839 23.3665 14.0016 22.9023 17.9639C22.5947 20.589 20.487 22.6352 17.8848 22.9258C14.0049 23.3586 9.99521 23.3586 6.11523 22.9258C3.51302 22.6352 1.40527 20.5891 1.09766 17.9639C0.633482 14.0016 0.633482 9.99839 1.09766 6.03613C1.40526 3.41099 3.51298 1.36466 6.11523 1.07422Z' fill='%2300AEF0' /%3E%3Cpath d='M16.8878 7.82951C17.3139 7.39016 18.0044 7.39016 18.4305 7.82951C18.8565 8.26886 18.8565 8.98101 18.4305 9.42036L11.8849 16.1705C11.4589 16.6098 10.7683 16.6098 10.3423 16.1705L7.06952 12.7954C6.64349 12.3561 6.64349 11.6439 7.06952 11.2046C7.49556 10.7652 8.18613 10.7652 8.61216 11.2046L11.1136 13.7842L16.8878 7.82951Z' fill='%23EBF7FD'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_4274_37805'%3E%3Crect width='24' height='24' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
      }

      @media screen and (min-width: 768px) {
        ::slotted(input[type="radio"]:checked)::after {
          right: -8px;
          top: -8px;
        }
      }

      ::slotted(img) {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        overflow: hidden;
      }

      slot[name="footer"]::slotted(ui-text) {
        padding: 8px;
        color: var(--foreground-brand-primary, #07C);
        background: var(--background-brand-primary, #EBF7FD);
        border-radius: 8px;
      }

      :host([checked]) slot[name="footer"]::slotted(ui-text) {
        background: var(--background-primary);
      }
    `,
};
