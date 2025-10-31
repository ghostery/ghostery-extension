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

function close(host) {
  host.remove();
}

const slide = {
  keyframes: [
    { opacity: 0, transform: 'translateY(-100%)' },
    { opacity: 1, transform: 'translateY(0)' },
  ],
  options: {
    duration: 300,
    easing: 'ease-in-out',
    fill: 'forwards',
  },
};

export default {
  type: { value: '', reflect: true },
  icon: 'info-filled',
  autoclose: {
    value: 5,
    connect(host, key) {
      const delay = host[key];
      if (delay) {
        const timeout = setTimeout(close, delay * 1000, host);
        return () => clearTimeout(timeout);
      }
    },
  },
  slide: {
    value: true,
    reflect: true,
    connect: (host, key) => {
      const value = host[key];
      if (value) {
        host.animate(slide.keyframes, slide.options);

        const parent = host.parentNode;
        const after = host.nextSibling;

        return () => {
          host.slide = false;
          parent.insertBefore(host, after);

          host
            .animate(slide.keyframes, {
              ...slide.options,
              direction: 'reverse',
            })
            .addEventListener('finish', () => {
              host.parentNode.removeChild(host);
            });
        };
      }
    },
  },
  render: ({ icon, autoclose }) => html`
    <template
      layout="grid:max|1|max items:center gap:0.5 height:5 padding:0:1.5"
      layout[slide]="absolute inset bottom:auto"
    >
      <ui-icon name="${icon}"></ui-icon>
      <ui-text type="label-s" underline layout="block:center" color="inherit">
        <slot></slot>
      </ui-text>
      ${!!autoclose &&
      html`<button onclick="${close}">
        <ui-icon name="close"></ui-icon>
      </button>`}
    </template>
  `.css`
    :host {
      background: var(--background-primary);
      border: 1px solid var(--border-primary);
      box-shadow: 0px 4px 12px 0px var(--shadow-card, rgba(0, 0, 0, 0.06));
      border-radius: 30px;
    }

    :host([type="success"]) {
      background: var(--background-success-primary);
      border-color: var(--border-success-primary);
      color: var(--color-success-primary);
    }

    :host([type="info"]) {
      background: var(--background-brand-primary);
      border-color: var(--border-brand-primary);
      color: var(--color-brand-primary);
    }

    :host([type="danger"]) {
      background: var(--background-danger-primary);
      border-color: var(--border-danger-primary);
      color: var(--color-danger-primary);
    }

    button {
      cursor: pointer;
      appearance: none;
      background: none;
      padding: 0;
      border: none;
      color: inherit;
    }
  `,
};

export function clearAlert() {
  const container = document.body.querySelector('#alert-container');
  if (!container) return;

  // remove existing alerts
  Array.from(container.children).forEach((child) => child.remove());
}

export async function showAlert(renderFn) {
  const wrapper = document.createDocumentFragment();

  const container = document.body.querySelector('#alert-container');
  if (!container) return;

  clearAlert();

  // wait a tick to ensure DOM updates
  await Promise.resolve();

  // render new alert
  html`<template layout>${renderFn}</template>`(wrapper);

  container.appendChild(wrapper);
}
