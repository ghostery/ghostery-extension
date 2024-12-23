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
        <div layout="row gap items:center">
          <ui-icon name="report" layout="size:2"></ui-icon>
          Report a broken page
        </div>
        <ui-action slot="actions">
          <a href="${router.backUrl()}">
            <ui-icon name="close" color="gray-800" layout="size:3"></ui-icon>
          </a>
        </ui-action>
      </ui-header>

      <panel-container>
        <div layout="column items:center gap padding:2:2:4">
          <img
            src="${contributionImage}"
            alt="Contribution"
            layout="size:20 margin:3"
          />
          <ui-text type="headline-s" layout="block:center width:::40">
            Thank you for your report!
          </ui-text>
          <ui-text type="body-m" layout="block:center width:::36">
            We appreciate your help in making the web a better place.
          </ui-text>
        </div>
      </panel-container>
    </template>
  `,
};
