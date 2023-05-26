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

function close(host, event) {
  event.preventDefault();
  event.stopPropagation();

  host.parentNode.removeChild(host);
}

export default {
  icon: '',
  href: '',
  type: '', // warning
  render: ({ icon, href }) => html`
    <template layout="block">
      <ui-action>
        <a
          href="${href}"
          target="_blank"
          layout="row gap:2 items:stretch padding:1.5"
        >
          ${icon &&
          html`
            <div id="icon" layout="row center shrink:0 width:5">
              <ui-icon name="${icon}" layout="margin"></ui-icon>
            </div>
          `}
          <div layout="column gap grow">
            <ui-text type="body-s"><slot></slot></ui-text>
            <ui-text id="action" type="label-s">
              <slot name="action"></slot>
            </ui-text>
          </div>
          <ui-action>
            <button
              id="close"
              onclick="${close}"
              layout="margin:-2 self:start shrink:0 padding"
            >
              <div layout="row center size:3">
                <ui-icon name="close" layout="size:2"></ui-icon>
              </div>
            </button>
          </ui-action>
        </a>
      </ui-action>
    </template>
  `.css`
    :host {
      --ui-panel-notification-bg: var(--ui-color-gray-100);
      --ui-panel-notification-color: var(--ui-color-primary-700);
    }

    #action {
      color: var(--ui-panel-notification-color);
    }

    :host([type="warning"]) {
      --ui-panel-notification-bg: var(--ui-color-danger-100);
      --ui-panel-notification-color: var(--ui-color-danger-700);
    }

    a {
      background: var(--ui-panel-notification-bg);
      border-radius: 12px;
      color: inherit;
      text-decoration: none;
    }

    #icon {
      background: var(--ui-color-white);
      box-shadow: 0px 2px 6px rgba(32, 44, 68, 0.08);
      border-radius: 8px;
    }

    #icon ui-icon {
      color: var(--ui-panel-notification-color);
    }

    #close > * {
      color: var(--ui-color-gray-600);
      background: var(--ui-color-white);
      border-radius: 12px;
    }

    @media (hover: hover) and (pointer: fine) {
      a:hover:not(:has(#close:hover)) {
        background: var(--ui-panel-notification-bg);
        --ui-text-color: var(--ui-panel-notification-color);
      }

      a:hover:not(:has(#close:hover)) #action {
        text-decoration: underline;
      }

      #close:hover > * {
        color: var(--ui-color-white);
        background: var(--ui-panel-notification-color);
      }
    }
  `,
};
