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

import { define, html, store } from 'hybrids';

import { sortCategories } from '/ui/categories.js';
import { getWTMStats } from '/utils/wtm-stats.js';
import Options from '/store/options.js';

import DisablePreviewImg from './assets/disable-preview.svg';

import './styles.css';

// Ensure the UI components are loaded
import '/ui/index.js';

function close() {
  window.parent?.postMessage('WTMReportClosePopups', '*');
}

async function disable(host) {
  await store.set(host.options, { wtmSerpReport: false });
  window.parent?.postMessage('WTMReportDisable', '*');
}

const domain = new URLSearchParams(window.location.search).get('domain');

define({
  tag: 'trackers-preview',
  confirmDisabled: false,
  options: store(Options),
  stats: () => getWTMStats(domain).sort(sortCategories()),
  render: {
    value: ({ confirmDisabled, options, stats }) => html`
      <template layout="block overflow">
        ${confirmDisabled
          ? html`
              <main layout="column gap:2 padding:3:5:3">
                <img
                  src="${DisablePreviewImg}"
                  alt="Disable Preview Trackers"
                  layout="self:center"
                />
                <div layout="block:center column gap">
                  <ui-text type="label-l">
                    Are you sure you want to disable Trackers Preview?
                  </ui-text>
                  <ui-text>
                    You will no longer see tracker wheels next to the search
                    results.
                  </ui-text>
                </div>
                <div layout="grid:2 gap:2">
                  <ui-button>
                    <button onclick="${html.set('confirmDisabled', false)}">
                      Cancel
                    </button>
                  </ui-button>
                  <ui-button id="disable" data-qa="button:confirm">
                    <button onclick="${disable}">Disable</button>
                  </ui-button>
                </div>
              </main>
            `
          : html`
              <ui-header>
                <ui-icon name="logo" slot="icon" layout="size:3"></ui-icon>
                <ui-text type="label-m">${domain}</ui-text>
                <ui-action slot="actions">
                  <button onclick="${close}" layout="row center size:3">
                    <ui-icon
                      name="close"
                      color="gray-800"
                      layout="size:2.5"
                    ></ui-icon>
                  </button>
                </ui-action>
              </ui-header>

              <main layout="padding:1.5">
                <ui-stats
                  domain="${domain}"
                  categories="${stats}"
                  layout="relative layer:101"
                  wtm-link
                  data-qa="component:stats"
                >
                </ui-stats>
              </main>
              ${store.ready(options) &&
              !options.managed &&
              html`<footer layout="row center padding:1:2">
                <ui-action>
                  <button
                    onclick="${html.set('confirmDisabled', true)}"
                    layout="row gap:0.5 padding"
                    data-qa="button:disable"
                  >
                    <ui-icon name="block-s" color="gray-600"></ui-icon>
                    <ui-text type="label-s" color="gray-600">
                      Disable Trackers Preview
                    </ui-text>
                  </button>
                </ui-action>
              </footer>`}
            `}
      </template>
    `.css`
      :host {
        border: 1px solid var(--ui-color-gray-300);
        border-radius: 16px;
      }

      footer {
        background: var(--ui-color-gray-100);
      }

      ui-button {
        text-transform: none;
        border-radius: 8px;
        box-shadow: 0px 2px 6px rgba(32, 44, 68, 0.08);
        --ui-button-color-hover: var(--ui-color-primary-700);
      }

      ui-button#disable {
        color: var(--ui-color-danger-500);
        --ui-button-color-hover: var(--ui-color-danger-700);
      }
    `,
    observe: (host) => {
      window.requestAnimationFrame(() => {
        window.parent?.postMessage(`WTMReportResize:${host.offsetHeight}`, '*');
      });
    },
  },
});
