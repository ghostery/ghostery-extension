/**
 * WhoTracks.Me
 * https://whotracks.me/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { html, define, dispatch } from 'hybrids';

import { sortCategories } from '@ghostery/ui/categories';
const sort = sortCategories();

export default define({
  tag: 'ui-trackers-preview',
  confirmDisabled: false,
  stats: undefined,
  domain: '',
  render: ({ domain, confirmDisabled, stats }) => html`
    <ui-header>
      <ui-text type="label-m">${domain}</ui-text>
      <button
        class="svg-button"
        onclick="${(host) => dispatch(host, 'close')}"
        slot="actions"
      >
        <ui-icon name="close"></ui-icon>
      </button>
    </ui-header>

    <main>
      ${stats &&
      html.resolve(
        stats.then(
          (data) => html`
            <ui-panel-stats
              domain="${domain}"
              categories="${data.stats.sort(sort)}"
            >
              <ui-text type="label-m">Trackers Preview</ui-text>
            </ui-panel-stats>
          `,
        ),
      )}
    </main>
    <footer>
      ${confirmDisabled
        ? html`
            <span>Are you sure?</span>
            <button onclick="${(host) => dispatch(host, 'disable')}">
              Disable Trackers Preview
            </button>
            <button onclick="${html.set('confirmDisabled', false)}">
              Cancel
            </button>
          `
        : html`
            <button onclick="${html.set('confirmDisabled', true)}">
              Disable Trackers Preview
            </button>
          `}
    </footer>
  `.css`
     :host {
       height: 100%;
       display: block;
       margin: 0 auto;
       background-color: #F8F8F8;
     }
 
     main {
       padding: 12px;
       background-color: white;
     }
 
     h1 {
       font-size: 16px;
       text-align: center;
       color: var(--ui-color-gray-900);
       white-space: nowrap;
       font-weight: 600;
       margin: 6px 0;
     }
 
     .svg-button {
       padding: 0;
       color: var(--ui-color-gray-900);
       background: none;
       border: 0;
       cursor: pointer;
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       height: 22px;
       width: 22px;
     }
 
     .svg-button ui-icon {
       height: 16px;
       width: 16px;
     }
 
     .buttons {
       display: grid;
       grid-template-columns: 1fr 1fr;
       column-gap: 10px;
       margin-top: 10px;
     }
 
     .buttons a {
       color: var(--ui-primary-700);
       padding: 10px 17px;
       flex: 1;
       text-align: center;
       cursor: pointer;
       text-decoration: none;
       background: #FFFFFF;
       box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.05);
       border-radius: 7.4px;
       display: flex;
       flex-direction: row;
       align-items: center;
       justify-content: center;
       white-space: nowrap;
     }
 
     .buttons a ui-icon {
       width: 10px;
       height: 10px;
       margin-left: 3px;
     }
 
     footer {
       border-top: 1px solid rgba(0, 0, 0, 0.1);
       display: flex;
       flex-direction: row;
       align-items: center;
       padding: 9px 6px;
     }
 
     footer button, footer span {
       background: none;
       border: none;
       color: var(--ui-color-gray-500);
       padding: 0;
       margin: 0;
       font-size: 11.5px;
       white-space: nowrap;
       margin: 0 3px;
       padding: 0 3px;
     }
 
     footer button {
       cursor: pointer;
     }
 
     footer button:hover {
       text-decoration: underline;
     }
 
     footer button svg {
       width: 10px;
       height: 10px;
     }
   `,
});
