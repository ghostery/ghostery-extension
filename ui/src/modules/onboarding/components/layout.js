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
import slogan from '../illustrations/slogan.js';

export default define({
  tag: 'ui-onboarding-layout',
  render: () => html`
    <header>
      <div id="welcome">
        <ui-text type="body-s">Welcome to</ui-text>
        <ui-icon name="logo-full"></ui-icon>
      </div>
      ${slogan}
    </header>
    <div id="content"><slot></slot></div>
  `.css`
    :host {
      display: flex;
      flex-flow: column;
      align-items: space-between;
      min-width: 375px;
      height: 100%;
      background: var(--ui-color-gray-800);
      color: var(--ui-color-white);
      --ui-onboarding-layout-padding: 24px;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: var(--ui-color-primary-500);
    }

    #welcome {
      padding-top: 12px;
      position: relative;
    }

    #welcome ui-text {
      position: absolute;
      left: 46px;
      top: 0px;
    }

    #content {
      display: flex;
      flex-flow: column;
    }

    @media screen and (min-width: 992px) {
      :host {
        flex-flow: row;
        --ui-onboarding-layout-padding: 40px;
      }

      header {
        width: 360px;
        flex-shrink: 0;
        flex-flow: column;
        padding: 64px 0;
      }

      #slogan {
        width: 227px;
        height: 64px;
      }

      #content {
        display: flex;
        flex-flow: column;
        align-items: center;
        flex-grow: 1;
        overflow-y: scroll;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        padding: var(--ui-onboarding-layout-padding);
        background: url('data:image/png;base64,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');
      }
    }
  `,
});
