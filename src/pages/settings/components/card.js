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
  type: { value: '', reflect: true },
  render: () => html`
    <template layout="block padding:2 relative">
      <slot name="picture"></slot>
      <div layout="column gap:2 grow"><slot></slot></div>
    </template>
  `.css`
    :host {
      background: var(--background-primary);
      border: 1px solid var(--border-primary);
      border-radius: 8px;
      box-shadow: 0px 4px 8px var(--shadow-card);
    }

    :host([type="content"]) {
      background: var(--background-secondary);
      border: none;
      box-shadow: none;
    }

    @keyframes pause-assistant-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    :host([type="pause-assistant"]) {
      background: transparent;
      border: none;
      overflow: hidden;
      box-shadow: none;
      padding: 12px;
    }

    :host([type="pause-assistant"])::before {
      content: '';
      position: absolute;
      top: -600px;
      left: -100px;
      right: -100px;
      bottom: -600px;
      background: var(--background-gradient-pause-assistant);
      filter: blur(25px);
      animation: pause-assistant-rotate 20s linear infinite;
    }

    :host([type="pause-assistant"]) div {
      position: relative;
    }
  `,
};
