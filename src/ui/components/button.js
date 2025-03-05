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
  type: { value: 'outline', reflect: true },
  disabled: {
    value: false,
    observe: (host, value) => {
      if (value) {
        host.tabIndex = -1;
      } else {
        host.removeAttribute('tabindex');
      }
    },
    reflect: true,
  },
  render: () => html`<slot></slot>`.css`
    :host {
      display: block;
      box-sizing: border-box;
      height: 40px;
      font: var(--font-label-m);
      border-radius: 8px;
      white-space: nowrap;
      transition: opacity 0.2s, color 0.2s, background-color 0.2s, border-color 0.2s;
      color: var(--button-color);
      border: 1px solid var(--button-border-color);
      background: var(--button-background);
      box-shadow: 0px 3px 8px 0px var(--shadow-button);
      --button-color: var(--color-onbrand);
      --button-border-color: var(--button-background);
    }

    @media print {
      :host { box-shadow: none; }
    }

    :host([hidden]) { display: none; }
    :host(:active) { opacity: 0.6; }

    :host([type="primary"]) {
      --button-background: var(--background-brand-solid);
    }

    :host([type="secondary"]) {
      --button-color: var(--color-primary);
      --button-background: var(--background-tertiary);
    }

    :host([type="success"]) {
      --button-background: var(--background-success-solid);
    }

    :host([type="danger"]) {
      --button-background: var(--background-danger-solid);
    }

    :host([type="outline"]) {
      --button-color: var(--color-primary);
      --button-border-color: var(--border-secondary);
      --button-background: var(--background-primary);
    }

    :host([type="outline-primary"]) {
      --button-color: var(--color-brand-primary);
      --button-border-color: var(--border-brand-secondary);
      --button-background: var(--background-primary);
    }

    :host([type="outline-success"]) {
      --button-color: var(--color-success-primary);
      --button-border-color: var(--border-success-secondary);
      --button-background: var(--background-primary);
    }

    :host([type="outline-danger"]) {
      --button-color: var(--color-danger-primary);
      --button-border-color: var(--border-danger-secondary);
      --button-background: var(--background-primary);
    }

    :host([type="transparent"]),
    :host([type="transparent"][disabled]) {
      box-shadow: none;
      --button-color: var(--color-primary);
      --button-background: transparent;
      --button-border-color: transparent;
    }

    :host([disabled]) {
      --button-color: var(--color-quaternary);
      --button-background: var(--background-tertiary);
      pointer-events: none;
    }

    @media (hover: hover) {
      :host([type="primary"]:active) { --button-background: var(--background-brand-strong); }
      :host([type="outline"]:hover) { --button-background: var(--background-secondary); }
      :host([type="outline"]:active) { --button-background: var(--background-tertiary); }
      :host([type="outline-primary"]:hover) { --button-background: var(--background-brand-primary); }
      :host([type="outline-primary"]:active) { --button-background: var(--background-brand-secondary); }
      :host([type="outline-danger"]:hover) { --button-background: var(--background-danger-primary); }
      :host([type="outline-danger"]:active) { --button-border: var(--border-danger-primary); --button-background: var(--background-primary); }
    }

    ::slotted(*) {
      display: grid;
      grid-auto-flow: column;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      place-items: center;
      appearance: none;
      border: none;
      padding: 0px 24px;
      margin: 0;
      background: none;
      color: inherit;
      font: inherit;
      text-transform: inherit;
      text-decoration: none;
      border-radius: 8px;
      padding: 0px 16px;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }

    ::slotted(*:focus-visible) {
      outline: 2px solid var(--border-brand-solid);
      outline-offset: 3px;
    }
  `,
};
