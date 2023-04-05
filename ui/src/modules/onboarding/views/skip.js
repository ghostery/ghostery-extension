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

import OutroSkip from './outro-skip.js';

export default define({
  [router.connect]: { dialog: true },
  tag: 'ui-onboarding-skip-dialog',
  content: () => html`
    <ui-onboarding-dialog>
      <ui-text slot="header" type="headline-m">
        Are you sure you want to keep Ghostery disabled?
      </ui-text>
      <ui-text>
        Ghostery stops trackers in their tracks and prevents you from being
        profiled by data brokers.
      </ui-text>
      <ui-text>
        Enable Ghostery to browse the web safer, faster, and with less ads.
      </ui-text>
      <ui-button type="outline" slot="footer">
        <a href="${router.backUrl()}">Back</a>
      </ui-button>
      <ui-button type="outline-error" slot="footer">
        <a href="${router.url(OutroSkip)}">Keep disabled</a>
      </ui-button>
    </ui-onboarding-dialog>
  `,
});
