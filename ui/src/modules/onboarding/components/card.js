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
  tag: 'ui-onboarding-card',
  type: '',
  render: () => html`
    <div id="illustration"><slot name="illustration"></slot></div>
    <div id="content"><slot></slot></div>
  `.css`
    :host {
      flex: 0 0 auto;
      display: block;
      box-sizing: border-box;
      padding: var(--ui-onboarding-layout-padding);
      background: var(--ui-color-gray-700);
    }

    :host([type="transparent"]) {
      background: none;
      box-shadow: none;
    }

    :host([type="highlight"]) {
      padding: 16px;
      background: var(--ui-color-gray-800);
      border-radius: 8px;
      box-shadow: none;
    }

    :host([type="highlight"]) #illustration {
      display: none;
    }

    #illustration {
      display: flex;
      justify-content: center;
    }

    #illustration ::slotted(*) {
      margin-bottom: 16px;
    }

    #content {
      display: grid;
      grid-gap: 16px;
    }

    @media screen and (max-width: 1279px) {
      :host([type="full-desktop"]) #illustration {
        display: none;
      }
    }
  
    @media screen and (min-width: 992px) {
      :host {
        box-sizing: border-box;
        box-shadow: 30px 60px 160px rgba(0, 0, 0, 0.4);
        border-radius: 16px;
      }
      
      :host([type="highlight"]) {
        margin-top: 24px;
      }

      #illustration ::slotted(*) {
        margin-bottom: 40px;
      }
    }
  `,
});
