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
import { openTabWithUrl } from '/utils/tabs.js';

export default {
  icon: '',
  href: '',
  type: { value: '', reflect: true }, // warning
  render: ({ icon, href }) => html`
    <template layout="block">
      <ui-action>
        <a
          href="${href}"
          onclick="${openTabWithUrl}"
          layout="row gap:2 items:stretch padding:1.5"
        >
          ${icon &&
          html`
            <div id="icon" layout="row center shrink:0 width:5">
              <ui-icon name="${icon}" layout="margin size:3"></ui-icon>
            </div>
          `}
          <div layout="column gap grow">
            <ui-text id="desc" type="body-s" color="gray-600">
              <slot></slot>
            </ui-text>
            <ui-text id="action" type="label-s">
              <slot name="action"></slot>
            </ui-text>
          </div>
        </a>
      </ui-action>
    </template>
  `.css`
    :host {
      --ui-notification-bg: var(--ui-color-gray-100);
      --ui-notification-color: var(--ui-color-primary-700);
    }

    :host([type="warning"]) {
      --ui-notification-bg: var(--ui-color-danger-100);
      --ui-notification-color: var(--ui-color-danger-700);
    }

    :host([type="review"]) #icon {
      position: relative;
      overflow: hidden;
      background: #0D1850;
    }


    :host([type="review"]) ui-icon {
      margin:0;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 56px;
      height: 56px;
    }

    a {
      background: var(--ui-notification-bg);
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
    }

    #action {
      color: var(--ui-notification-color);
    }

    #icon {
      background: var(--ui-color-layout);
      box-shadow: 0px 2px 6px rgba(32, 44, 68, 0.08);
      border-radius: 8px;
    }

    ui-icon {
      color: var(--ui-notification-color);
    }

    @media (hover: hover) {
      a:hover ui-text {
        text-decoration: underline;
      }
    }
  `,
};
