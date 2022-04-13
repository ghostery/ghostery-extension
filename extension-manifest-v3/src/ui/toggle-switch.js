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

import { html, define } from 'hybrids';
import { t } from '/vendor/@whotracksme/ui/src/i18n.js';

import './icon.js';

export default define({
  tag: 'gh-panel-toggle-switch',
  name: '',
  disabled: false,
  render: ({ name, disabled }) => html`
    <button class=${{ disabled }}>
      <gh-icon name="${name}"></gh-icon>
      <label>${t(`block_toggle_${name}`)}</label>
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

    button::before {
      content: '${t('on')}';
      display: block;
      text-transform: uppercase;
      color: var(--deep-blue);
      position: absolute;
      top: 10px;
      right: 8px;
    }

    button gh-icon {
      color: var(--deep-blue);
      margin-bottom: 5px;
    }

    button.disabled gh-icon {
      color: #C1C1C1;
    }

    button label {
      cursor: pointer;
      white-space: wrap;
    }

    button.disabled {
      background: #F8F8F8;
      border: 0.5px solid #D0D0D0;
      color: #808080;
      box-shadow: none;
    }

    button.disabled::before {
      color: #C1C1C1;
      content: '${t('off')}';
    }
  `,
});
