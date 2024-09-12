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

import { html, dispatch } from 'hybrids';
import { sortCategories } from '@ghostery/ui/categories';

import DisablePreviewImg from '../assets/disable-preview.svg';

const sort = sortCategories();

export default {
  confirmDisabled: false,
  stats: undefined,
  domain: '',
  render: ({ domain, confirmDisabled, stats }) => html`
    <template layout="block height:full">
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
                <ui-button type="outline" size="small">
                  <button onclick="${html.set('confirmDisabled', false)}">
                    Cancel
                  </button>
                </ui-button>
                <ui-button id="disable" type="outline" size="small">
                  <button onclick="${(host) => dispatch(host, 'disable')}">
                    Disable
                  </button>
                </ui-button>
              </div>
            </main>
          `
        : html`
            <ui-panel-header>
              <ui-icon name="logo" slot="icon" layout="size:3"></ui-icon>
              <ui-text type="label-m">${domain}</ui-text>
              <ui-action slot="actions">
                <button
                  onclick="${(host) => dispatch(host, 'close')}"
                  layout="row center size:3"
                >
                  <ui-icon
                    name="close"
                    color="gray-800"
                    layout="size:2.5"
                  ></ui-icon>
                </button>
              </ui-action>
            </ui-panel-header>

            <main layout="padding:1.5">
              ${stats &&
              html`
                <ui-panel-stats
                  domain="${domain}"
                  categories="${stats.sort(sort)}"
                  layout="relative layer:101"
                  wtm-link
                >
                </ui-panel-stats>
              `}
            </main>
            <footer layout="row center padding:2">
              <ui-action>
                <button
                  onclick="${html.set('confirmDisabled', true)}"
                  layout="row gap:0.5"
                >
                  <ui-icon name="block-s" color="gray-600"></ui-icon>
                  <ui-text type="label-s" color="gray-600">
                    Disable Trackers Preview
                  </ui-text>
                </button>
              </ui-action>
            </footer>
          `}
    </template>
  `.css`
    :host {
      border: 1px solid var(--ui-color-gray-300);
      border-radius: 16px;
      overflow: hidden;
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
};
