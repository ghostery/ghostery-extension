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
  tag: 'ui-onboarding-state',
  disabled: false,
  href: '',
  render: ({ disabled, href }) => html`
    ${disabled &&
    html`
      <header>
        <ui-text type="label-m" color="primary-500">
          <ui-icon name="warning"></ui-icon>
          Additional Permissions Required
        </ui-text>
        <ui-text class="button" type="label-m" color="white">
          Enable Ghostery
        </ui-text>
      </header>
      <a href="${href}" target="_blank"></a>
    `}
    <div id="content"><slot></slot></div>
  `.css`
    :host {
      display: block;
      position: relative;
    }

    :host([disabled]) {
      border: 1px dashed #C8C7C2;
      border-radius: 4px;
    }

    :host([disabled])::before {
      z-index: 1;
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      backdrop-filter: blur(1px);
      background: linear-gradient(180deg, rgba(191, 191, 191, 0.05) 0%, rgba(190, 190, 190, 0.4) 100%);
    }

    header {
      position: relative;
      z-index: 2;
      display: flex;
      flex-flow: row wrap;
      padding: 8px;
      border-bottom: 1px dashed #C8C7C2;
    }

    header ui-text {
      flex: 5 1 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      column-gap: 8px;
      padding: 8px 0px;
    }

    header ui-text.button {
      flex: 1 0 auto;
      background: #00AEF0;
      border-radius: 2px;
      padding: 8px 12px;
    }

    a {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 3;
    }

    :host([disabled]) #content {
      z-index: 0;
      padding: 8px;
    }
  `,
});
