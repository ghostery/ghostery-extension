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

import { TERMS_AND_CONDITIONS_URL } from '/utils/urls.js';

import skipImage from '../assets/skip.svg';

export default {
  render: () => html`
    <template layout="column gap:2 width:::375px">
      <ui-card data-qa="view:skip">
        <section layout="block:center column gap:2">
          <div layout="row center">
            <img src="${skipImage}" alt="Skip" layout="size:20" />
          </div>
          <ui-text type="display-s" color="danger-secondary">
            Ghostery is installed with limited functionality
          </ui-text>
          <ui-text type="body-m">
            Ghostery Tracker & Ad Blocker is naming the trackers present on
            websites you visit. You are browsing the web unprotected.
          </ui-text>
          ${chrome.management?.uninstallSelf &&
          html`
            <ui-button
              type="danger"
              onclick="${() =>
                chrome.management.uninstallSelf({ showConfirmDialog: true })}"
              layout="self:center margin:top:2"
            >
              <button>Uninstall</button>
            </ui-button>
          `}
        </section>
      </ui-card>
      <ui-button type="transparent" layout="self:center">
        <a href="${TERMS_AND_CONDITIONS_URL}" target="_blank">
          Terms & Conditions
        </a>
      </ui-button>
    </template>
  `,
};
