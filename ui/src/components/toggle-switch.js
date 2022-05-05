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

import { define, html, msg } from 'hybrids';

export default define({
  tag: 'ui-toggle-switch',
  name: '',
  label: '',
  disabled: false,
  render: ({ name, label, disabled }) => html`
    <button class=${{ disabled }}>
      <ui-icon name="${name}"></ui-icon>
      ${label}
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
      font-family: inherit;
      font-size: inherit;
      text-align: left;
      white-space: wrap;
      box-shadow: -2px -4px 6px rgba(255, 255, 255, 0.64), 0px 2px 4px rgba(0, 0, 0, 0.1);
      border: 0.5px solid #D0D0D0;
      color: var(--ui-black);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    button::before {
      content: '${msg`on`}';
      display: block;
      text-transform: uppercase;
      color: var(--ui-deep-blue);
      position: absolute;
      top: 10px;
      right: 8px;
    }

    button ui-icon {
      color: var(--ui-deep-blue);
      margin-bottom: 5px;
    }

    button.disabled ui-icon {
      color: #C1C1C1;
    }

    button.disabled {
      background: #F8F8F8;
      border: 0.5px solid #D0D0D0;
      color: #808080;
      box-shadow: none;
    }

    button.disabled::before {
      color: #C1C1C1;
      content: '${msg`off`}';
    }
  `,
});
