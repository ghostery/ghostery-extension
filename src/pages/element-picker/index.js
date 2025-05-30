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

import { mount, html, store } from 'hybrids';

import ElementPickerSelectors from '/store/element-picker-selectors.js';

import selectImage from './assets/select.svg';
import hiddenImage from './assets/hidden.svg';

import '/ui/index.js';

import './elements.js';
import './styles.css';

const hostname = new URLSearchParams(window.location.search).get('hostname');

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

function updateSelector(host, event) {
  sendMessage('gh:element-picker:selector', {
    selector: event.target.value,
  });
}

function toggleSimilar(host, event) {
  sendMessage('gh:element-picker:similar', {
    value: event.target.checked,
  });
}

function slide(host, event) {
  sendMessage('gh:element-picker:slider', {
    value: event.target.value,
  });
}

async function hide(host) {
  host.state = 'hidden';
  sendMessage('gh:element-picker:hide');

  const elementPickerSelectors = await store.resolve(ElementPickerSelectors);
  const list = elementPickerSelectors.hostnames[hostname] || [];

  if (!list.includes(host.selector)) {
    await store.set(elementPickerSelectors, {
      hostnames: { [hostname]: list.concat(host.selector) },
    });
  }
}

async function back(host) {
  host.state = 'configure';
  sendMessage('gh:element-picker:back');

  const elementPickerSelectors = await store.resolve(ElementPickerSelectors);
  let list = elementPickerSelectors.hostnames[hostname] || [];
  const index = list.indexOf(host.selector);

  if (index > -1) {
    list = list.filter((_, i) => i !== index);
    await store.set(elementPickerSelectors, {
      hostnames: { [hostname]: list.length ? list : null },
    });
  }
}

new ResizeObserver(() => {
  sendMessage('gh:element-picker:resize', {
    height: document.body.clientHeight,
  });
}).observe(document.body, { box: 'border-box' });

mount(document.body, {
  state: 'select', // select, configure, hidden
  selector: '',
  sliderValue: {
    value: 1,
    observe(host, value, lastValue) {
      if (lastValue) host.slider = value;
    },
  },
  sliderMax: 1,
  similar: false,
  render: {
    value: ({ state, selector, sliderValue, sliderMax, similar }) => html`
      <template layout="column height:full">
        <div layout="row items:center content:space-between height:4.5">
          <ui-icon name="drag" color="tertiary" layout="padding:1"></ui-icon>
          ${state === 'configure' &&
          html`<ui-text type="label-m" layout="row items:center gap">
            <ui-icon name="logo" layout="size:2.5"></ui-icon>
            Hide content block
          </ui-text>`}
          <ui-button type="transparent" onclick="${close}">
            <button layout="padding:0:1">
              <ui-icon name="close" color="tertiary"></ui-icon>
            </button>
          </ui-button>
        </div>

        ${state === 'select' &&
        html`
          <div layout="grow column center gap:2 padding:0:1.5:1.5">
            <img src="${selectImage}" width="200" height="96" />
            <div layout="block:center padding:bottom:2">
              <ui-text type="label-l">Hide distraction</ui-text>
              <ui-text color="tertiary">Select distracting element</ui-text>
            </div>
          </div>
        `}
        ${state === 'configure' &&
        html`
          <element-picker-container layout="column gap:1.5 padding:1.5">
            <div layout="column gap">
              <ui-input>
                <textarea
                  style="resize:none"
                  rows="3"
                  value="${selector}"
                  spellcheck="false"
                  autocorrect="off"
                  oninput="${updateSelector}"
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
            ${sliderMax > 1 &&
            html`
              <div layout="column gap">
                <div layout="column">
                  <ui-text type="label-s" layout="block:center">
                    Move the slider to show or hide sections.
                  </ui-text>
                  <element-picker-range
                    max="${sliderMax}"
                    value="${sliderValue}"
                    oninput="${slide}"
                  ></element-picker-range>
                  <div layout="row content:space-between items:center">
                    <ui-text type="label-xs" color="tertiary" uppercase>
                      Zoom out
                    </ui-text>
                    <ui-text type="label-xs" color="tertiary" uppercase>
                      Zoom in
                    </ui-text>
                  </div>
                </div>
              </div>
            `}
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
          <div layout="column center gap padding:0:1.5:0">
            <img src="${hiddenImage}" width="200" height="96" />
            <div layout="block:center padding:bottom:2">
              <ui-text type="label-l">Gone!</ui-text>
              <ui-text type="body-s" color="tertiary">
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
          Object.assign(host, event.data);
        }
      });
    },
  },
});
