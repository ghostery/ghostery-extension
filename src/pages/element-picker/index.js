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

import { mount, html } from 'hybrids';

import '/ui/index.js';

import './elements.js';
import './styles.css';

import selectImage from './assets/select.svg';
import hiddenImage from './assets/hidden.svg';

function sendMessage(type, data) {
  window.parent.postMessage({ type, ...data }, '*');
}

function close() {
  sendMessage('gh:element-picker:close');
}

function reselect(host) {
  host.state = 'select';
  sendMessage('gh:element-picker:reselect');
}

function hide(host) {
  host.state = 'hidden';
  sendMessage('gh:element-picker:hide');
}

function slide(host, event) {
  sendMessage('gh:element-picker:slider', {
    value: event.target.valueAsNumber,
  });
}

function toggleSimilar(host, event) {
  sendMessage('gh:element-picker:similar', {
    value: event.target.checked,
  });
}

function back(host) {
  host.state = 'configure';
  sendMessage('gh:element-picker:back');
}

mount(document.body, {
  state: 'select', // select, configure, hidden
  selector: '',
  slider: {
    value: 10,
    observe(host, value, lastValue) {
      if (lastValue) host.slider = value;
    },
  },
  similar: false,
  render: {
    value: ({ state, selector, slider, similar }) => html`
      <template layout="column height:full">
        <element-picker-header>
          ${state === 'configure' &&
          html`<ui-text type="label-m" layout="row items:center gap">
            <ui-icon name="logo" layout="size:2.5"></ui-icon>
            Hide distracting content block
          </ui-text>`}
          <ui-button type="transparent" onclick="${close}">
            <button>
              <ui-icon name="close" color="tertiary"></ui-icon>
            </button>
          </ui-button>
        </element-picker-header>
        ${state === 'select' &&
        html`
          <div layout="grow column center gap:2 padding:0:1.5:1.5">
            <img src="${selectImage}" width="300" height="144" />
            <div layout="block:center">
              <ui-text type="label-l">Distraction Be Gone</ui-text>
              <ui-text color="tertiary">
                Click on distracting content block.
              </ui-text>
            </div>
          </div>
        `}
        ${state === 'configure' &&
        html`
          <element-picker-container
            layout="overflow:scroll grow column gap:2 padding:1.5"
          >
            <div layout="column gap">
              <ui-input>
                <textarea
                  style="resize:none"
                  readonly
                  rows="5"
                  value="${selector}"
                ></textarea>
              </ui-input>
              <label layout="row items:center gap">
                <ui-input>
                  <input
                    type="checkbox"
                    checked="${similar}"
                    onchange="${toggleSimilar}"
                  />
                </ui-input>
                <ui-text type="body-xs" color="tertiary">
                  Block similar elements
                </ui-text>
              </label>
            </div>
            <div layout="column gap:2">
              <div layout="column gap">
                <ui-text type="label-m" layout="block:center">
                  Move the slider to show or hide sections.
                </ui-text>
                <input
                  type="range"
                  min="1"
                  max="${slider}"
                  value="${slider}"
                  oninput="${slide}"
                />
                <div layout="row content:space-between items:center">
                  <ui-text type="label-xs" color="tertiary">MIN</ui-text>
                  <ui-text type="label-xs" color="tertiary">MAX</ui-text>
                </div>
              </div>
            </div>
          </element-picker-container>
          <element-picker-footer>
            <ui-button onclick="${reselect}">
              <button>Reselect</button>
            </ui-button>
            <ui-button type="danger" onclick="${hide}">
              <button>Hide</button>
            </ui-button>
          </element-picker-footer>
        `}
        ${state === 'hidden' &&
        html`
          <div
            layout="overflow:scroll grow column items:center gap:2 padding:0:1.5:0"
          >
            <img src="${hiddenImage}" width="300" height="144" />
            <div layout="block:center">
              <ui-text type="label-l">Ta-da!</ui-text>
              <ui-text color="tertiary">
                Ghostery added a rule to keep this content block hidden. You can
                undo this anytime in website settings.
              </ui-text>
            </div>
          </div>
          <element-picker-footer>
            <ui-button onclick="${back}">
              <button>Back</button>
            </ui-button>
            <ui-button type="primary" onclick="${close}">
              <button>Done</button>
            </ui-button>
          </element-picker-footer>
        `}
      </template>
    `,
    connect: (host) => {
      window.addEventListener('message', (event) => {
        if (event.data?.type === 'gh:element-picker:selector') {
          host.state = 'configure';

          host.selector = event.data.selector;
          host.slider = event.data.slider;
          host.similar = event.data.similar;
        }
      });
    },
  },
});
