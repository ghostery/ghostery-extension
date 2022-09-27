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
  tag: 'ui-onboarding-dialog',
  render: () => html`
    <div id="dialog">
      <div id="content">
        <header><slot name="header"></slot></header>
        <slot></slot>
      </div>
      <footer><slot name="footer"></slot></footer>
    </div>
  `.css`
    :host {
      background: rgba(18, 18, 28, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      --ui-onboarding-dialog-spacing: 20px;
      padding: var(--ui-onboarding-dialog-spacing);
      z-index: 1000;
    }

    #dialog {
      display: flex;
      flex-flow: column;
      position: relative;
      box-sizing: border-box;
      background: var(--ui-color-white);
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 100%;
      box-shadow: 30px 60px 160px rgba(0, 0, 0, 0.2);
    }

    #content {
      display: grid;
      grid-auto-rows: min-content;
      gap: 16px;
      overflow-y: auto;
      overscroll-behavior: contain;
      max-height: 100%;
      padding: var(--ui-onboarding-dialog-spacing) var(--ui-onboarding-dialog-spacing) calc(var(--ui-onboarding-dialog-spacing) + 80px);
    }

    footer {
      z-index: 1;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0 var(--ui-onboarding-dialog-spacing) var(--ui-onboarding-dialog-spacing);
      display: flex;
      gap: 16px;
      justify-content: stretch;
      margin-top: 24px;
    }

    footer::before {
      z-index: 0;
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      border-radius: 16px;
      background: linear-gradient(0deg, var(--ui-color-white) 0%, rgba(47, 49, 54, 0) 100%);
    }

    footer ::slotted(*) {
      position: relative;
      z-index: 2;
      flex: 1;
    }

    @media screen and (min-width: 768px) {
      :host {
        --ui-onboarding-dialog-spacing: 40px;
      }

      footer {
        justify-content: flex-end;
      }

      footer ::slotted(*) {
        flex: 0;
      }
    }
  `,
});
