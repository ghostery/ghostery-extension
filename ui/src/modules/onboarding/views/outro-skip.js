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

import { define, html } from 'hybrids';

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
        <ui-onboarding-card type="highlight" layout="margin:top:4">
          <ui-text type="body-m" color="gray-600">
            You can change your mind at any time and enable Ghostery in the
            Ghostery panel to start tracking the trackers.
          </ui-text>
        </ui-onboarding-card>
      </ui-onboarding-card>
    </template>
  `,
});
