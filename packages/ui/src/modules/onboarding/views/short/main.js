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

import { define, html, msg, router } from 'hybrids';

import Privacy from '../privacy.js';
import OutroSkip from './outro-skip.js';
import OutroSuccess from '../outro-success.js';

const TERMS_AND_CONDITIONS_URL =
  'https://www.ghostery.com/privacy/ghostery-terms-and-conditions?utm_source=gbe';

export default define({
  [router.connect]: { stack: [Privacy, OutroSkip] },
  tag: 'ui-onboarding-short-main-view',
  content: () => html`
    <template layout="grow column gap">
      <ui-onboarding-card>
        <div layout="column gap:5">
          <section layout="block:center column gap">
            <ui-text type="body-l" layout="margin:top:2">
              Welcome to Ghostery
            </ui-text>
            <ui-text type="display-m" layout="margin:bottom:5">
              Enable Ghostery to get started
            </ui-text>
          </section>
        </div>
        <div layout="column gap:3">
          <div layout="column gap">
            <ui-text type="display-2xs" layout="block:center">
              Your Privacy Features:
            </ui-text>
            <div layout="grid:3 gap">
              <ui-onboarding-feature icon="onboarding-adblocking">
                Ad-Blocking
              </ui-onboarding-feature>
              <ui-onboarding-feature icon="onboarding-anti-tracking">
                Anti-Tracking
              </ui-onboarding-feature>
              <ui-onboarding-feature icon="onboarding-never-consent">
                Never-Consent
              </ui-onboarding-feature>
            </div>
          </div>
          <ui-text underline>
            ${msg.html`
              Information about web trackers will be shared in accordance with our <a href="${router.url(
                Privacy,
              )}">Privacy Policy</a>, advancing privacy protection for the Ghostery community.
            `}
          </ui-text>
          <div layout="column gap:3">
            <ui-button type="success" size="small">
              <a href="${router.url(OutroSuccess)}">Enable Ghostery</a>
            </ui-button>
            <ui-onboarding-error-card>
              <ui-text type="label-s" color="error-500" layout="block:center">
                Without privacy features enabled, only basic functionality of
                naming trackers is available.
              </ui-text>
              <ui-button type="outline-error" size="small">
                <a href="${router.url(OutroSkip)}">Keep disabled</a>
              </ui-button>
            </ui-onboarding-error-card>
          </div>
        </div>
      </ui-onboarding-card>
      <ui-text layout="block:center margin:3:0" underline>
        <a href="${TERMS_AND_CONDITIONS_URL}" target="_blank">
          Terms & Conditions
        </a>
      </ui-text>
    </template>
  `,
});
