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

export default {
  render: () => html`
    <template
      layout="column height:100%"
      layout@992px="grid:280px|1:min|1"
      layout@1280px="grid:320px|1:min|1"
    >
      <header
        layout="row center gap padding:2 relative layer"
        layout@992px="padding:5:3 content:start"
      >
        <ui-icon
          name="logo-full"
          color="primary-500"
          layout="height:4 margin:bottom:-2px"
        ></ui-icon>
        <ui-text type="label-s">Settings</ui-text>
      </header>
      <nav
        layout="order:1 row content:space-around padding gap:0.5"
        layout@992px="grid:1:repeat(3,max-content)|1|max content:stretch padding:0:2:2 layer"
      >
        <slot name="nav"></slot>
      </nav>
      <main layout="column grow overflow:scroll" layout@992px="area::2">
        <slot
          layout::slotted(*)="padding:4:2"
          layout::slotted(*)@768px="padding:5:6"
          layout::slotted(*)@992px="padding:6:3 area::2"
          layout::slotted(*)@1280px="padding:8:3"
        ></slot>
      </main>
    </template>
  `.css`
    :host {
      background: var(--ui-color-white);
    }

    header, nav {
      background: var(--ui-color-white);
      box-shadow: 0px 0px 80px rgba(32, 44, 68, 0.1);
    }

    header {
      border-bottom: 1px solid var(--ui-color-gray-200);
    }

    header ui-text {
      color: var(--ui-color-white);
      background: var(--ui-color-primary-500);
      border-radius: 4px;
      padding: 2px 4px;
    }

    nav {
      border-top: 1px solid var(--ui-color-gray-200);
    }

    nav ::slotted(a) {
      box-sizing: border-box;
      display: flex;
      flex-flow: column;
      align-items: center;
      gap: 4px;
      color: var(--ui-color-gray-900);
      text-decoration: none;
      font: var(--ui-font-label-xs);
      text-overflow: ellipsis;
      overflow: hidden;
      flex: 1 1 0;
      max-width: 165px;
      border-radius: 6px;
      padding: 6px 4px 4px;
      text-align: center;
      --ui-color-nav: currentColor;
      transition: color 0.2s, opacity 0.2s;
    }

    @media (hover: hover) and (pointer: fine) {
      nav ::slotted(a:hover) {
        color: var(--ui-color-primary-700);
        --ui-color-nav: currentColor;
      }
    }

    nav ::slotted(a:active) {
      opacity: 0.6;
    }

    nav ::slotted(a.active) {
      color: var(--ui-color-primary-700);
      background: var(--ui-color-primary-100);
    }

    @media screen and (min-width: 992px) {
      header, nav {
        box-shadow: none;
        border: none;
        border-right: 1px solid var(--ui-color-gray-200);
      }

      nav ::slotted(a) {
        font: var(--ui-font-label-l);
        gap: 8px;
        padding: 12px;
        flex: 0;
        flex-flow: row;
        max-width: none;
        text-align: left;
        --ui-color-nav: var(--ui-color-gray-600);
      }

      nav ::slotted(a.active) {
        --ui-color-nav: var(--ui-color-primary-700);
      }

      nav ::slotted(a.bottom) {
        grid-row: 5;
      }
    }

    @media screen and (min-width: 1280px) {
      main ::slotted(*) {
        max-width: 720px;
        margin: 0 auto;
      }
    }
  `,
};
