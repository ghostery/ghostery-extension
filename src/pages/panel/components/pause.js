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

import { dispatch, html, msg } from 'hybrids';
import { themeToggle } from '/ui/theme.js';

const PAUSE_TYPES = [
  {
    value: 1,
    label: msg`1 hour`,
    description: msg`This site will be paused for 1 hour`,
  },
  {
    value: 24,
    label: msg`1 day`,
    description: msg`This site will be paused for 1 day`,
  },
  {
    value: 0,
    label: msg`Always`,
    description: msg`This site will always be paused. You can change this at any time in Ghostery settings to stop trackers and ads from tracking you around the web`,
  },
];

function dispatchAction(host) {
  dispatch(host, 'action');
}

function dispatchTypeAction(type) {
  return (host) => {
    host.pauseType = type;
    dispatchAction(host);
  };
}

function openPauseList(host, event) {
  host.pauseList = true;
  event.stopPropagation();

  document.body.addEventListener(
    'click',
    (e) => {
      host.pauseList = false;

      e.stopPropagation();
      e.preventDefault();
    },
    { once: true },
  );
}

function simulateClickOnEnter(host, event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    event.target.click();
  }
}

export default {
  paused: { value: false, reflect: true },
  global: { value: false, reflect: true },
  revokeAt: 0,
  pauseType: 1,
  pauseList: false,
  render: ({ paused, pauseType, pauseList, revokeAt }) =>
    html`
      <template layout="grid relative">
        <button
          id="main"
          class="${{ active: pauseList }}"
          layout="row center margin:1.5 height:6"
          layout@390px="height:7"
          onclick="${!pauseList && dispatchAction}"
          data-qa="button:pause"
        >
          <div id="label" layout="grow row center gap shrink overflow">
            <ui-icon name="pause"></ui-icon>
            <div layout="column">
              <ui-text type="label-m" color="inherit">
                ${paused ? msg`Ghostery is paused` : msg`Pause on this site`}
              </ui-text>
              ${!!revokeAt &&
              html`<ui-text type="body-xs" color="inherit">
                <ui-revoke-at revokeAt="${revokeAt}"></ui-revoke-at>
              </ui-text>`}
            </div>
          </div>
          <div
            id="type"
            role="button"
            tabindex="${paused ? '-1' : '0'}"
            layout="row center self:stretch width:14"
            onclick="${!paused && !pauseList && openPauseList}"
            onkeypress=${!paused && !pauseList && simulateClickOnEnter}
          >
            ${paused
              ? html`
                  <ui-icon name="refresh"></ui-icon>
                  <ui-text
                    type="label-m"
                    layout="margin:left:0.5"
                    color="inherit"
                  >
                    Undo
                  </ui-text>
                `
              : html`
                  <ui-text type="label-m" layout="grow" color="inherit">
                    ${PAUSE_TYPES.find(({ value }) => value === pauseType)
                      .label}
                  </ui-text>
                  <ui-icon name="chevron-down"></ui-icon>
                `}
          </div>
        </button>
        <slot></slot>
        ${pauseList &&
        html`
          <section
            id="type-list"
            layout="column absolute layer:102 top:full left:2 right:2 margin:top:-20px"
          >
            ${PAUSE_TYPES.map(
              ({ value, label, description }) => html`
                <button
                  class="${{ active: pauseType === value }}"
                  onclick="${dispatchTypeAction(value)}"
                  layout.active="grid:1|max:auto"
                >
                  <ui-text type="label-m">${label}</ui-text>
                  ${pauseType === value &&
                  html`<ui-icon name="check"></ui-icon>`}
                  <ui-text type="body-s" color="secondary" layout="area:2">
                    ${description}
                  </ui-text>
                </button>
              `,
            )}
          </section>
        `}
      </template>
    `.css`
    :host {
      background: var(--color-brand-200);
    }

    button {
      cursor: pointer;
      appearance: none;
      border: none;
      text-align: left;
      background: none;
    }

    #main {
      box-shadow: 0px 2px 8px rgba(0, 105, 210, 0.2);
      border-radius: 8px;
      box-sizing: border-box;
      padding: 4px;
      white-space: nowrap;
      color: var(--color-brand-600);
      background: var(--color-base-white);
      transition: background 0.2s, opacity 0.2s;
    }

    #main:active:not(:has(#type:hover)), :host([paused]) #main:active {
      opacity: 0.6;
    }

    #type {
      box-sizing: border-box;
      background: var(--color-brand-200);
      border: 1px solid var(--color-brand-300);
      border-radius: 8px;
      padding: 8px 8px 8px 12px;
      white-space: nowrap;
      transition: width 0.2s;
    }

    #type ui-icon {
      transition: transform 0.1s;
    }

    #main.active #type ui-icon {
      transform: rotate(180deg);
    }

    #type-list {
      background: var(--background-primary);
      box-shadow: 0px 4px 12px var(--shadow-card);
      border-radius: 12px;
    }

    #type-list button {
      padding: 16px 20px;
    }

    #type-list button:first-child {
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }

    #type-list button:last-child {
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }

    /* Website paused */

    :host([paused]) {
      background: var(--color-warning-100);
    }

    :host([paused]) #main {
      box-shadow: none;
      background: #ffbb00;
      color: var(--color-gray-800);
    }

    :host([paused]) #type {
      background: var(--color-base-white);
      color: var(--color-primary);
      border: none;
      pointer-events: all;
      overflow: hidden;
    }

    /* Global pause */

    :host([global]) {
      background: var(--color-danger-100);
    }

    :host([global]) #main {
      box-shadow: none;
      background: var(--color-danger-700);
      color: var(--color-base-white);
    }

    @media (hover: hover) {
      :host(:not([paused])) #type:hover {
        border-color: var(--color-brand-600);
        background: var(--color-brand-600);
        color: var(--color-base-white);
      }

      :host([paused]) #main:hover:has(#type:hover) #label, :host([paused]) #main:focus-visible #label {
        width: 0;
      }

      :host([paused]) #main #type:hover, :host([paused]) #main:focus-visible #type {
        width: 100%;
        transition: width 0.2s;
      }

      #type-list button:hover {
        background: var(--background-brand-primary);
      }

      #type-list button:hover ui-text,
      #type-list button:hover ui-icon {
        color: var(--color-brand-primary);
      }
    }

    @media (prefers-color-scheme: dark) {
      :host, :host([paused]) {
        background: var(--color-gray-900);
      }

      #main {
        background: var(--color-brand-800);
        color: var(--color-brand-400);
        shadow: 0px 2px 8px var(--color-gray-900);
      }

      #type {
        background: var(--color-brand-900);
        color: var(--color-brand-400);
        border: none;
      }

      #type-list {
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.4);
      }

      :host([paused]) #type {
        background: var(--background-primary);
        color: var(--color-base-white);
      }

      :host([global]) #type {
        background: var(--color-danger-800);
        color: var(--color-base-white);
      }

      :host(:not([paused])) #type:hover {
        background: var(--color-brand-700);
      }
    }
  `.use(themeToggle),
};
