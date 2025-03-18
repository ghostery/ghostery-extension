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
  type: { value: 'body-m', reflect: true },
  mobileType: { value: '', reflect: true },
  color: 'primary',
  ellipsis: { value: false, reflect: true },
  underline: { value: false, reflect: true },
  uppercase: { value: false, reflect: true },
  render: ({ type, mobileType, color }) => html`<slot></slot>`.css`
    :host {
      display: block;
      font: var(--font-${mobileType || type});
      color: var(--color-${color});
    }

    :host([hidden]) {
      display: none;
    }

    ${
      mobileType &&
      /*css*/ `
          @media screen and (min-width: 768px) {
            :host { font: var(--font-${type}); }
          }
        `
    }

    :host([type^="display"]), :host([type^="headline"]) {
      text-wrap: balance;
    }

    :host([ellipsis]) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host([uppercase]) {
      text-transform: uppercase;
    }

    :host([type^="body"][underline]) ::slotted(a) {
      text-decoration: underline;
    }

    @media (hover: hover) {
      :host([underline]) ::slotted(a:hover) {
        text-decoration: underline;
      }
    }

    ::slotted(*) { color: inherit; }
    ::slotted(ui-text) { display: inline; }

    :host([type^="body"]) ::slotted(a) { color: var(--color-brand-primary); font-weight: 600; }
    ::slotted(a) { outline-color: var(--border-brand-solid); transition: color 0.2s, opacity 0.2s; text-decoration: none; -webkit-tap-highlight-color: transparent; }
    ::slotted(a:active) { opacity: 0.6; }
    ::slotted(a:not([href])) { opacity: 0.6; pointer-events: none; }

    ::slotted(ul) { padding: 0; margin: 0 0 0 1.5em; }
  `,
};
