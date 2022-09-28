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

import { define, html, msg } from 'hybrids';

import protection from '../illustrations/protection.js';

const FAQ_URL = 'https://www.ghostery.com/faq';
const SUPPORT_EMAIL = `support@ghostery.com`;

export default define({
  tag: 'ui-onboarding-outro-success-view',
  content: () => html`
    <template layout="block">
      <ui-card>
        <div slot="illustration">${protection}</div>
        <section layout="block:center column gap:2" layout@768px="margin:0:6">
          <ui-text type="display-l">You're all set, Ghosterian!</ui-text>
          <ui-text type="body-xl" color="gray-800">
            Ghostery is set up to stop trackers in their tracks and protect your
            privacy while browsing!
          </ui-text>
        </section>
        <ui-card type="highlight" layout="margin:top:5">
          <section layout="column gap">
            <ui-text type="label-xl">Any questions? Anytime!</ui-text>
            <ui-text type="body-l">
              ${msg.html`
                Check out <a href="${FAQ_URL}" target="_blank">FAQs</a> or drop us a line at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
                <br/> We'll be more than happy to talk to you!
              `}
            </ui-text>
          </section>
        </ui-card>
      </ui-card>
    </template>
  `,
});
