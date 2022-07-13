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

import sleep from '../illustrations/sleep.js';

export default define({
  tag: 'ui-onboarding-outro-skip-view',
  content: () => html`
    <ui-onboarding-layout>
      <ui-onboarding-card>
        <div slot="illustration">${sleep}</div>
        <ui-text type="display-xl">
          You chose to skip enabling Ghostery!
        </ui-text>
        <ui-text type="body-xl">
          The Ghostery Browser Extension is installed in your browser but Ghosty
          is taking a light nap.
        </ui-text>
        <ui-onboarding-card type="highlight">
          <ui-text type="body-xl">
            You can change your mind anytime and enable Ghostery to start
            tracking the trackers for you in Ghostery settings.
          </ui-text>
        </ui-onboarding-card>
      </ui-onboarding-card>
    </ui-onboarding-layout>
  `,
});
