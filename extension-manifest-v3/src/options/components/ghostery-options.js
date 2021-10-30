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

import { html, define, store } from '/hybrids.js';

const Options = {
  trackerWheelDisabled: false,
  [store.connect] : {
    get: async () => {
      const storage = await chrome.storage.local.get(['options']);
      const options =  storage.options || {};
      if (typeof options.trackerWheelDisabled === "undefined") {
        options.trackerWheelDisabled = false;
      }
      return options;
    },
    set: (_, options) => {
      chrome.storage.local.set({ options });
      chrome.runtime.sendMessage({ action: 'updateOptions' });
      return options;
    },
  },
};

function updateOptions(host) {
  const shadowRoot = host.render();
  const options = { ...host.options };
  options.trackerWheelDisabled = shadowRoot.querySelector("#trackerWheelDisabled").checked;
  console.warn('optios', options)
  store.set(Options, options);
}

define({
  tag: "ghostery-options",
  options: store(Options),
  render: ({ options }) => html`
    <header>
      <h1>Ghostery Options</h1>
    </header>
    <main>
      <h2>User interface</h2>
      ${store.ready(options) && html`
        <ul>
          <li>
            <label for="trackerWheelDisabled">Disable Tracker Wheel in browser toolbar</label>
            <input
              type="checkbox"
              id="trackerWheelDisabled"
              checked="${options.trackerWheelDisabled}"
              onchange="${updateOptions}"
            />
          </li>
        </ul>
      `}
    </main>
  `.css`
    :host {
      max-width: 800px;
      display: block;
      margin: 0 auto;
    }
    header {
      background: var(--ghostery);
      color: white;
      padding: 10px 0px;
    }
    header h1 {
      text-align: center;
      margin: 0px;
    }
    main {
      background-color: #F8F8F8;
      padding: 50px 12px;
    }
    h2 {
      font-weight: 500;
      margin: 0 0 10px 10px;
    }
    ul {
      margin: 0;
      padding: 0;
      list-style-type: none;
      list-style: none none inside;
    }
    li {
      background-color: white;
      border-radius: 8px;
      display: flex;
      flex-direction: row;
      margin-bottom: 10px;
      padding: 10px;
      box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.05);
    }
    li label {
      flex: 1;
      cursor: pointer;
    }
  `,
});
