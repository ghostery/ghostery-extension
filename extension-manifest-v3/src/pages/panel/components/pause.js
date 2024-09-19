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
  render: ({ paused, pauseType, pauseList, revokeAt }) => html`
    <template layout="grid relative">
      <button
        id="main"
        class="${{ active: pauseList }}"
        layout="row center margin:1.5 height:6"
        layout@390px="height:7"
        onclick="${!pauseList && dispatchAction}"
      >
        <div id="label" layout="grow row center gap shrink overflow">
          <ui-icon name="pause"></ui-icon>
          <div layout="column">
            <ui-text type="label-m" color="inherit">
              ${paused ? msg`Ghostery is paused` : msg`Pause on this site`}
            </ui-text>
            ${!!revokeAt &&
            html`<ui-text type="body-xs" color="inherit">
              <ui-panel-revoke-at revokeAt="${revokeAt}"></ui-panel-revoke-at>
            </ui-text>`}
            <slot></slot>
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
                  ${PAUSE_TYPES.find(({ value }) => value === pauseType).label}
                </ui-text>
                <ui-icon name="arrow-down"></ui-icon>
              `}
        </div>
      </button>
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
                ${pauseType === value && html`<ui-icon name="check"></ui-icon>`}
                <ui-text type="body-s" color="gray-600" layout="area:2">
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
      background: var(--ui-color-primary-200);
    }

    button {
      cursor: pointer;
      appearance: none;
      border: none;
      text-align: left;
      color: var(--ui-color-gray-800);
      background: var(--ui-color-layout);
    }

    #main {
      box-shadow: 0px 2px 8px rgba(0, 105, 210, 0.2);
      border-radius: 8px;
      box-sizing: border-box;
      padding: 4px;
      white-space: nowrap;
      color: var(--ui-color-primary-700);
      transition: background 0.2s, opacity 0.2s;
    }

    #main:active:not(:has(#type:hover)), :host([paused]) #main:active {
      opacity: 0.6;
    }

    #type {
      box-sizing: border-box;
      background: var(--ui-color-primary-100);
      border-radius: 8px;
      border: 1px solid var(--ui-color-primary-300);
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
      background: var(--ui-color-layout);
      box-shadow: 0px 4px 12px rgba(0, 105, 210, 0.4);
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
      background: var(--ui-color-warning-100);
    }

    :host([paused]) #main {
      box-shadow: none;
      background: var(--ui-color-warning-500);
      color: var(--ui-color-gray-800);
    }

    :host([paused]) #type {
      background: var(--ui-color-layout);
      border: none;
      pointer-events: all;
      overflow: hidden;
    }

    /* Global pause */

    :host([global]) {
      background: var(--ui-color-danger-100);
    }

    :host([global]) #main {
      box-shadow: 0px 2px 8px rgba(210, 138, 0, 0.2);
      background: var(--ui-color-danger-500);
      color: white;
    }

    :host([global]) #type {
      color: var(--ui-color-danger-500);
    }

    @media (hover: hover) {
      :host(:not([paused])) #main:hover {
        background: var(--ui-color-primary-500);
      }

      :host(:not([paused])) #main:hover #label {
        color: white;
      }

      :host(:not([paused])) #main:hover #type {
        border: none;
      }

      :host(:not([paused])) #type:hover {
        background: var(--ui-color-primary-700);
        color: white;
      }

      :host([paused]) #main:hover:has(#type:hover) #label, :host([paused]) #main:focus-visible #label {
        width: 0;
      }

      :host([paused]) #main #type:hover, :host([paused]) #main:focus-visible #type {
        width: 100%;
        transition: width 0.2s;
      }

      #type-list button:hover {
        background: var(--ui-color-primary-100);
      }

      #type-list button:hover ui-text,
      #type-list button:hover ui-icon {
        color: var(--ui-color-primary-700);
      }
    }

    @media (prefers-color-scheme: dark) {
      :host {
        background: var(--ui-color-gray-100);
      }

      #main {
        background: var(--ui-color-primary-200);
      }

      #type {
        border: none;
        background: var(--ui-color-primary-100);
      }

      #type-list {
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.4);
      }

      :host([paused]) #label {
        color: var(--ui-color-gray-100);
      }

      :host([global]) #label,
      :host([global]) #type {
        color: var(--ui-color-gray-800);
      }
    }

    @media (prefers-color-scheme: dark) and (hover: hover) {
      :host(:not([paused])) #main:hover {
        background: var(--ui-color-primary-300);
      }

      :host(:not([paused])) #type:hover {
        background: var(--ui-color-primary-200);
      }
    }
  `,
};
