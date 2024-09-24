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
import { GHOSTERY_DOMAIN } from '/utils/urls.js';

import Privacy from './privacy.js';
import Skip from './skip.js';
import Success from './success.js';

const TERMS_AND_CONDITIONS_URL = `https://www.${GHOSTERY_DOMAIN}/privacy/ghostery-terms-and-conditions?utm_source=gbe&utm_campaign=onboarding`;

export default define({
  [router.connect]: { stack: [Privacy, Skip] },
  tag: 'onboarding-main-view',
  render: () => html`
    <template layout="grow column gap">
      <ui-card layout="gap:3">
        <section layout="block:center column gap margin:2:0:1">
          <ui-text type="body-l">Welcome to Ghostery</ui-text>
          <ui-text type="display-m">Enable Ghostery to get started</ui-text>
        </section>
        <div layout="column gap:2">
          <ui-text type="body-l" layout="block:center">
            Your Privacy Features:
          </ui-text>
          <div layout="grid:3 gap">
            <onboarding-feature icon="onboarding-adblocking">
              Ad-Blocking
            </onboarding-feature>
            <onboarding-feature icon="onboarding-anti-tracking">
              Anti-Tracking
            </onboarding-feature>
            <onboarding-feature icon="onboarding-never-consent">
              Never-Consent
            </onboarding-feature>
          </div>
        </div>
        <ui-text underline>
          ${msg.html`
              Information about web trackers will be shared in accordance with our <a href="${
                __PLATFORM__ === 'firefox'
                  ? 'https://addons.mozilla.org/firefox/addon/ghostery/privacy/'
                  : router.url(Privacy)
              }" target="_blank" rel="noreferrer">Privacy Policy</a>, advancing privacy protection for the Ghostery community.
            `}
        </ui-text>
        <div layout="column gap:2">
          <ui-button type="success">
            <a href="${router.url(Success)}">Enable Ghostery</a>
          </ui-button>
          <onboarding-error-card layout="margin:top">
            <ui-text type="label-s" color="danger-500" layout="block:center">
              Without privacy features enabled, only basic functionality of
              naming trackers is available.
            </ui-text>
            <ui-button type="outline-error">
              <a href="${router.url(Skip)}">Keep disabled</a>
            </ui-button>
          </onboarding-error-card>
        </div>
      </ui-card>
      <div layout="column center">
        <ui-button type="transparent">
          <a href="${TERMS_AND_CONDITIONS_URL}" target="_blank">
            Terms & Conditions
          </a>
        </ui-button>
      </div>
    </template>
  `,
});
