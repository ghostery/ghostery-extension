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

import { html, router } from 'hybrids';

import contributionImage from '../assets/contribution.svg';

export default {
  render: () => html`
    <template layout="column grow">
      <ui-header>
        <ui-text type="label-m" layout="row gap items:center"> Report an issue </ui-text>
      </ui-header>

      <panel-container layout="relative">
        <div layout="column items:center gap:3 padding:2:2:4">
          <img src="${contributionImage}" alt="Contribution" layout="size:20 margin:3" />
          <div layout="column gap:0.5">
            <ui-text type="label-m" layout="block:center width:::40">
              Thank you for your report!
            </ui-text>
            <ui-text type="body-s" layout="block:center width:::36">
              Your contribution helps build a more private and safe internet for the entire Ghostery
              community.
            </ui-text>
          </div>
          <panel-delayed-action delay="8">
            <ui-button type="outline">
              <a href="${router.backUrl()}">Close</a>
            </ui-button>
          </panel-delayed-action>
        </div>
      </panel-container>
    </template>
  `,
};
