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
import { GHOSTERY_DOMAIN } from '@ghostery/libs';

import Privacy from './privacy.js';
import Skip from './skip.js';
import OutroSkip from './outro-skip.js';
import OutroSuccess from './outro-success.js';

const TERMS_AND_CONDITIONS_URL = `https://www.${GHOSTERY_DOMAIN}/privacy/ghostery-terms-and-conditions?utm_source=gbe&utm_campaign=onboarding`;

export default define({
  [router.connect]: { stack: [Skip, Privacy, OutroSkip] },
  tag: 'ui-onboarding-main-view',
  renew: false,
  render: ({ renew }) => html`
    <template layout="grow column gap">
      <ui-onboarding-card>
        <div layout="column gap:5">
          <section layout="block:center column gap">
            <ui-text type="body-l" layout="margin:top:2">
              Welcome to Ghostery
            </ui-text>
            <ui-text type="display-m" layout="margin:bottom:5">
              ${renew
                ? html`renew GHOSTERY for full protection`
                : html`Enable Ghostery to get started`}
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
              Information about web trackers will be shared in accordance with our
              <a href="${router.url(Privacy)}">Privacy Policy</a>`}.
          </ui-text>
          <div layout="column gap">
            <ui-button type="success">
              <a href="${router.url(OutroSuccess)}"
                >${renew ? html`Enable New Setup` : html`Enable Ghostery`}</a
              >
            </ui-button>
            <ui-button type="transparent">
              ${renew
                ? html`<a href="${router.url(OutroSkip)}">Disable Ghostery</a>`
                : html`<a href="${router.url(Skip)}">Cancel</a>`}
            </ui-button>
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
