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
  static: { value: false, reflect: true },
  render: () => html`<template layout="block padding:2"><slot></slot></template>`.css`
    :host {
      background: var(--background-primary);
      border: 1px solid var(--border-primary);
      border-radius: 12px;
    }

    @media (hover: hover) {
      :host(:not([static]):hover) {
        border-color: var(--border-secondary);
        box-shadow: 0px 4px 12px var(--shadow-card);
      }
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
      position: relative;
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

    :host([type="pause-assistant"]) ::slotted(*) {
      position: relative;
    }

    ::slotted(ui-toggle) {
      padding: 16px;
      margin: -16px;
    }
  `,
};
