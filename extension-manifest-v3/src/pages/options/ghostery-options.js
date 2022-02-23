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

import { html, define, store } from 'hybrids';
import { t } from '/vendor/@whotracksme/ui/src/i18n.js';

const Options = {
  trackerWheelDisabled: false,
  wtmSerpReport: true,
  [store.connect]: {
    async get() {
      const storage = await chrome.storage.local.get(['options']);
      return storage.options || {};
    },
    async set(_, options, keys) {
      const prevOptions = await this.get();
      const nextOptions = {
        ...prevOptions,
        ...Object.fromEntries(keys.map((key) => [key, options[key]])),
      };

      chrome.storage.local.set({ options: nextOptions });
      chrome.runtime.sendMessage({ action: 'updateOptions' });

      return options;
    },
  },
};

export default define({
  tag: 'ghostery-options',
  options: store(Options),
  render: ({ options }) => html`
    <header>
      <h1>Ghostery Options</h1>
    </header>
    <main>
      <h2>User interface</h2>
      ${store.ready(options) &&
      html`
        <ul>
          <li>
            <label>
              <span>${t('options_tracker_wheel_disabled')}</span>
              <input
                type="checkbox"
                checked="${options.trackerWheelDisabled}"
                onchange="${html.set(options, 'trackerWheelDisabled')}"
              />
            </label>
          </li>
          <li>
            <label>
              <span>${t('settings_wtm_serp_report')}</span>
              <input
                type="checkbox"
                checked="${options.wtmSerpReport}"
                onchange="${html.set(options, 'wtmSerpReport')}"
              />
            </label>
          </li>
        </ul>
      `}
    </main>
  `.css`
    :host {
      height: 100%;
      max-width: 800px;
      display: block;
      margin: 0 auto;
      background-color: #F8F8F8;
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
      align-items: center;
    }
    li label {
      display: flex;
      justify-content: space-between;
      flex: 1;
      cursor: pointer;
    }
  `,
});
