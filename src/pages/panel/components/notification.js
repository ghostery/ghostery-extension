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

import { html, store } from 'hybrids';

import { openTabWithUrl } from '/utils/tabs.js';

import Notification from '../store/notification.js';

export default {
  notification: store(Notification),
  type: {
    value: ({ notification }) => notification.type,
    reflect: true,
  },
  render: ({ notification }) => html`
    <template layout="block width:min:full padding:1:2:1.5:1.5">
      <ui-action>
        <a
          href="${notification.url}"
          onclick="${openTabWithUrl}"
          layout="row gap:2 items:stretch padding:1.5"
        >
          ${(notification.icon || notification.img) &&
          html`
            <div id="icon" layout="row center shrink:0">
              ${notification.icon &&
              html`<ui-icon
                name="${notification.icon}"
                layout="margin size:3"
              ></ui-icon>`}
              ${notification.img &&
              html`<img src="${notification.img}" alt="" />`}
            </div>
          `}
          <div layout="column gap grow">
            <ui-text id="desc" type="body-s" color="secondary">
              ${notification.text}
            </ui-text>
            <ui-text id="action" type="label-s">
              ${notification.action}
            </ui-text>
          </div>
        </a>
      </ui-action>
    </template>
  `.css`
    :host {
      --ui-notification-bg: var(--background-secondary);
      --ui-notification-color: var(--color-brand-primary);
    }

    :host([type="danger"]) {
      --ui-notification-bg: var(--background-danger-primary);
      --ui-notification-color: var(--color-danger-primary);
    }

    :host([type="review"]) #icon {
      background: #0D1850;
      width: 40px;
    }

    :host([type="review"]) img {
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
      position: relative;
      overflow: hidden;
      background: var(--background-primary);
      box-shadow: 0px 2px 6px var(--shadow-button);
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
