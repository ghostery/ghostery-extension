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

import { html, store } from 'hybrids';

import Options from '/store/options.js';

export default {
  options: store(Options),
  render: ({ options }) => html`
    <template layout="contents">
      <settings-page-layout layout="column gap:4">
        ${store.ready(options) &&
        html`
          <section layout="column gap:4">
            <div layout="column gap" layout@992px="margin:bottom">
              <settings-back-button></settings-back-button>
              <ui-text type="headline-m">Never-Consent</ui-text>
              <div layout="column gap:0.5">
                <ui-text type="body-l" mobile-type="body-m" color="secondary">
                  Extended settings for automatically rejecting cookie consent notices.
                </ui-text>
              </div>
            </div>
            <div layout="column gap">
              <settings-toggle
                value="${options.autoconsent.gpc}"
                onchange="${html.set(options, 'autoconsent.gpc')}"
              >
                Global Privacy Control
                <span slot="description">
                  When enabled, your browser sends a signal to websites asking them not to sell or
                  share your personal data for advertising, in line with privacy laws like those in
                  California and the EU.
                </span>
              </settings-toggle>
              <settings-option>
                Automatic Action Type
                <span slot="description">
                  Chooses the default behavior for cookie consent notices.
                </span>
                <ui-input slot="action">
                  <select
                    value="${options.autoconsent.autoAction}"
                    onchange="${html.set(options, 'autoconsent.autoAction')}"
                  >
                    <option value="optOut">Opt out</option>
                    <option value="optIn">Opt in</option>
                    <option value="">None</option>
                  </select>
                </ui-input>
              </settings-option>
            </div>
          </section>
        `}
      </settings-page-layout>
    </template>
  `,
};
