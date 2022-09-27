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

export default define({
  [router.connect]: { dialog: true },
  tag: 'ui-onboarding-whotracksme-dialog',
  content: () => html`
    <ui-onboarding-dialog>
      <ui-text slot="header" type="headline-m">What is whotracks.me?</ui-text>
      <ui-text>
        WhoTracks.Me, operated by Ghostery, is an integral part of Ghostery’s AI
        anti-tracking technology. It is a comprehensive global resource on
        trackers, bringing transparency to web tracking.
      </ui-text>
      <ui-text>
        It exists thanks to micro-contributions of every Ghostery user who
        chooses to send non-personal information to WhoTracks.Me. The input
        enables Ghostery to provide real-time intel on trackers which in turn
        provides protection to the entire Ghostery community.
      </ui-text>
      <ui-text>
        More information on
        ${html`<a
          href="https://www.ghostery.com/ghostery-manifesto#whotracks-me-methodology"
          target="_blank"
          translate="no"
          >WhoTracks.Me</a
        >`}
        methodology in Ghostery’s Manifesto.
      </ui-text>

      <ui-button slot="footer">
        <a href="${router.backUrl()}">Ok, I understand</a>
      </ui-button>
    </ui-onboarding-dialog>
  `,
});
