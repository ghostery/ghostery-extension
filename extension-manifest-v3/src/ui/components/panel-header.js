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

import { html, define } from '/hybrids.js';

define({
  domain: '',
  tag: 'panel-header',
  render: ({ domain }) => html`
    <a target="_blank" href="https://www.ghostery.com">
      <img src="/images/logo.svg" />
    </a>
    <span class="domain-name"> ${domain} </span>
    <slot></slot>
    <div class="notch"></div>
  `.css`
    :host {
      background-color: var(--ghostery);
      color: white;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 9px 12px;
      position: relative;
    }

    .notch {
      background-color: #F8F6F6;
      border-radius: 3px;
      transform: rotate(45deg);
      width: 18px;
      height: 18px;
      bottom: -12px;
      position: absolute;
      left: calc(50% - 10px);
    }

    a {
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
    }

    .domain-name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      flex-grow: 1;
      font-size: 15px;
      text-align: center;
    }

    ::slotted(a) {
      color: white;
    }
  `,
});
