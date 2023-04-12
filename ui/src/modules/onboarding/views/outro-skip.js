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

import { define, html, router } from 'hybrids';

import disabled from '../illustrations/disabled.js';

export default define({
  tag: 'ui-onboarding-outro-skip-view',
  content: () => html`
    <template layout="block">
      <ui-onboarding-card>
        <section layout="block:center column gap:2">
          <div layout="row center">${disabled}</div>
          <ui-text type="display-m" color="error-500">
            Ghostery is disabled
          </ui-text>
          <ui-text type="body-m" color="gray-800">
            Ghostery Browser Extension is installed in your browser but is
            inactive. You are browsing the web unprotected.
          </ui-text>
        </section>
        <section layout="row center margin:top:4 margin:bottom">
          <ui-button type="outline">
            <a href="${router.backUrl()}">Enable Ghostery</a>
          </ui-button>
        </section>
      </ui-onboarding-card>
    </template>
  `,
});
