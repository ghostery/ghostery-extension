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

import { html, define, svg } from '/hybrids.js';
import { toggleBlocking } from '../../store/settings.js';
import { t } from '../../../common/i18n.js';

const icons = {
  'ads': svg`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.9999 29.0097C15.9999 29.0097 27.0027 23.682 27.0027 15.6905V6.36707L15.9999 2.37132L4.99713 6.36707V15.6905C4.99713 23.682 15.9999 29.0097 15.9999 29.0097Z" stroke="currentColor" stroke-width="2.40816" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'tracking': svg`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.9572 4H21.0429L28.1808 11.1379V21.2236L21.0429 28.3616H10.9572L3.81921 21.2236V11.1379L10.9572 4Z" stroke="currentColor" stroke-width="2.40816" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.69495 7.87573L24.3051 24.4859" stroke="currentColor" stroke-width="2.41"/>
  </svg>`,
  'annoyances': svg`<svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6679 8.13889H4V27.7445H25.3518V23.9963V18.5183" stroke="currentColor" stroke-width="2.41" stroke-linejoin="round"/>
    <rect x="10.6499" y="4.25563" width="18.3501" height="15.4681" stroke="currentColor" stroke-width="2.41" stroke-linejoin="round" stroke-dasharray="2.41 1.41"/>
  </svg>
  `,
};

define({
  tag: "toggle-switch",
  toggle: '',
  settings: null,
  render: ({ toggle, settings }) => html`
    <button
      onclick=${() => toggleBlocking(toggle)}
      class=${{ disabled: !settings.blockingStatus[toggle]}}
    >
      ${icons[toggle]}
      <label>${t(`block_toggle_${toggle}`)}</label>
    </button>
  `.css`
    button {
      box-sizing: border-box;
      background-color: white;
      border-radius: 10px;
      padding: 7px 8px;
      border: 0px;
      cursor: pointer;
      height: 100%;
      width: 100%;
      text-align: left;
      box-shadow: -2px -4px 6px rgba(255, 255, 255, 0.64), 0px 2px 4px rgba(0, 0, 0, 0.1);
      border: 0.5px solid #D0D0D0;
      color: var(--black);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    button::after {
      content: ' ';
      display: block;
      background: #C82121;
      width: 3px;
      height: 3px;
      border-radius: 3px;
      position: absolute;
      top: 10px;
      right: 8px;
    }

    button svg {
      color: var(--deep-blue);
      margin-bottom: 5px;
    }

    button label {
      cursor: pointer;
      width: 1px;
      white-space: wrap;
    }

    button.disabled {
      background: #F8F8F8;
      border: 0.5px solid #D0D0D0;
      color: #808080;
      box-shadow: none;
    }

    button.disabled svg {
      color: #C1C1C1;
    }

    button.disabled::after {
      background-color: #E0E0E0;
    }
  `,
});
