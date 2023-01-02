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

import { html, define, msg, dispatch } from 'hybrids';
import { sortCategories } from '@ghostery/ui/categories';

// Panel UI
import '../panel/index.js';

const sort = sortCategories();

export default define({
  tag: 'ui-trackers-preview',
  confirmDisabled: false,
  stats: undefined,
  domain: '',
  render: ({ domain, confirmDisabled, stats }) => html`
    <template layout="block height:full">
      <ui-panel-header>
        <ui-text type="label-m">${domain}</ui-text>
        <ui-action slot="actions">
          <button
            onclick="${(host) => dispatch(host, 'close')}"
            layout="row center size:3"
          >
            <ui-icon name="close" color="gray-900"></ui-icon>
          </button>
        </ui-action>
      </ui-panel-header>

      <main layout="padding:1.5">
        ${stats &&
        html.resolve(
          stats.then(
            (data) => html`
              <ui-panel-stats
                domain="${domain}"
                categories="${data.stats.sort(sort)}"
                label="${msg`Trackers Preview`}"
                layout="relative layer:101"
              >
              </ui-panel-stats>
            `,
          ),
        )}
      </main>
      <footer layout="row padding gap">
        ${confirmDisabled
          ? html`
              <ui-text type="body-s" color="gray-600">Are you sure?</ui-text>
              <ui-action>
                <button onclick="${(host) => dispatch(host, 'disable')}">
                  <ui-text type="body-s" color="gray-600">
                    Disable Trackers Preview
                  </ui-text>
                </button>
              </ui-action>
              <ui-action>
                <button onclick="${html.set('confirmDisabled', false)}">
                  <ui-text type="body-s" color="gray-600">Cancel</ui-text>
                </button>
              </ui-action>
            `
          : html`
              <ui-action>
                <button onclick="${html.set('confirmDisabled', true)}">
                  <ui-text type="body-s" color="gray-600">
                    Disable Trackers Preview
                  </ui-text>
                </button>
              </ui-action>
            `}
      </footer>
    </template>
  `.css`
     :host {
       background-color: #F8F8F8;
     }

     main {
       background-color: white;
     }

     footer {
       border-top: 1px solid rgba(0, 0, 0, 0.1);
     }
   `,
});
