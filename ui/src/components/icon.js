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

// prettier-ignore
const icons = {
  'ads': html`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M10.9572 4H21.0429L28.1808 11.1379V21.2236L21.0429 28.3616H10.9572L3.81921 21.2236V11.1379L10.9572 4Z" stroke="currentColor" stroke-width="2.40816" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7.69495 7.87573L24.3051 24.4859" stroke="currentColor" stroke-width="2.41"/>
    </svg>
  `,
  'annoyances': html`
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
      <path d="M11.6679 8.13889H4V27.7445H25.3518V23.9963V18.5183" stroke="currentColor" stroke-width="2.41" stroke-linejoin="round"/>
      <rect x="10.6499" y="4.25563" width="18.3501" height="15.4681" stroke="currentColor" stroke-width="2.41" stroke-linejoin="round" stroke-dasharray="2.41 1.41"/>
    </svg>
  `,
  'chevron-right': html`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>`,
  'chevron-left': html`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>`,
  'chevron-down': html`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>`,
  'close': html`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x">
      <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`,
  'external-link': html`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>`,
  'logo': html`
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
      <g fill="none" fill-rule="evenodd">
        <path d="M16.415 9.158c0 3.493-2.94 6.325-6.566 6.325-3.627 0-6.567-2.832-6.567-6.325 0-3.494 2.94-6.326 6.566-6.326 3.625 0 6.565 2.832 6.565 6.326" fill="#FFF"/>
        <path d="M18.65 17.774c-.91-1.995-1.067-3.686-1.09-4.35V7.96C17.56 3.783 13.992.4 9.594.4 5.195.4 1.63 3.783 1.63 7.96v5.543c-.034.715-.213 2.354-1.087 4.27-1.176 2.578-.203 2.27.668 2.06.873-.212 2.818-1.04 3.426-.02.608 1.018 1.115 1.903 2.533 1.326s2.086-.77 2.29-.77h.274c.202 0 .87.193 2.29.77 1.418.576 1.925-.31 2.533-1.328.607-1.02 2.553-.19 3.424.02.873.212 1.845.52.67-2.058" fill="#FFF"/>
        <path d="M7.136 4.52c.858 0 1.554 1.046 1.554 2.335 0 1.288-.696 2.333-1.554 2.333-.857 0-1.553-1.045-1.553-2.333 0-1.29.696-2.334 1.553-2.334M9.595 13.847c-1.89 0-3.482-1.765-3.96-3.73.925 1.208 2.354 1.985 3.96 1.985 1.605 0 3.035-.777 3.96-1.985-.48 1.965-2.07 3.73-3.96 3.73M12.053 9.188c-.858 0-1.553-1.045-1.553-2.333 0-1.29.695-2.334 1.553-2.334.86 0 1.553 1.046 1.553 2.335 0 1.288-.694 2.333-1.553 2.333" fill="#00AEF0"/>
      </g>
    </svg>
  `,
  'settings': html`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-settings">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>`,
  'tracking': html`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M15.9999 29.0097C15.9999 29.0097 27.0027 23.682 27.0027 15.6905V6.36707L15.9999 2.37132L4.99713 6.36707V15.6905C4.99713 23.682 15.9999 29.0097 15.9999 29.0097Z" stroke="currentColor" stroke-width="2.40816" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
 };

export default define({
  tag: 'ui-icon',
  name: '',
  render: ({ name }) => (icons[name] || html``).css`
    :host { display: inline-flex; justify-content: center; align-items: center }
    :host([hidden]) { display: none; }

    svg {
      max-width: 100%;
      max-height: 100%;
    }
   `,
});
