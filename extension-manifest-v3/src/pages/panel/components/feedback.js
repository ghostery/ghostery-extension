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

import { html } from 'hybrids';

export default {
  blocked: 0,
  modified: 0,
  render: ({ blocked, modified }) => html`
    <template layout="row">
      ${(blocked > 0 || modified > 0) &&
      html`
        ${blocked > 0 &&
        html`
          <section layout="column center grow padding:1.5:0">
            <div layout="row center gap:0.5">
              <ui-icon name="block" color="danger-700"></ui-icon>
              <ui-text type="headline-m">${blocked}</ui-text>
            </div>
            <div layout="row center gap:0.5">
              <ui-text type="label-xs">Trackers blocked</ui-text>
              <ui-tooltip wrap autohide="10">
                <span slot="content" layout="block width:200px">
                  Number of trackers with blocked network requests.
                </span>
                <ui-icon name="info" color="gray-400" layout="size:2"></ui-icon>
              </ui-tooltip>
            </div>
          </section>
        `}
        ${modified > 0 &&
        html`
          <section layout="column center grow padding:1.5:0">
            <div layout="row center gap:0.5">
              <ui-icon name="eye" color="primary-700"></ui-icon>
              <ui-text type="headline-m">${modified}</ui-text>
            </div>
            <div layout="row center gap:0.5">
              <ui-text type="label-xs">Trackers modified</ui-text>
              <ui-tooltip wrap autohide="10">
                <span slot="content" layout="block width:200px">
                  Number of trackers with removed cookies or fingerprints.
                </span>
                <ui-icon name="info" color="gray-400" layout="size:2"></ui-icon>
              </ui-tooltip>
            </div>
          </section>
        `}
      `}
    </template>
  `.css`
    :host {
      background: var(--ui-color-gray-100);
    }
  `,
};
