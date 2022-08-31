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
  content: () =>
    html`
      <ui-onboarding-dialog>
        <ui-text slot="header" type="headline-m" color="white">
          What is whotracks.me?
        </ui-text>
        <ui-text type="body-s">
          WhoTracks.me, operated by Ghostery, is the most comprehensive global
          resource on trackers, bringing transparency to web tracking.
        </ui-text>
        <ui-text type="body-s">
          It exists thanks to micro-contributions of every Ghostery user who
          chooses to send tracker information to whotracks.me. The tracker input
          enables Ghostery to provide real-time intel on trackers and protection
          to the entire Ghostery user community.
        </ui-text>
        <ui-text type="body-s">
          More information on
          ${html`<a href="https://whotracks.me" target="_blank" translate="no"
            >WhoTracks.Me</a
          >`}.
        </ui-text>

        <ui-button slot="footer">
          <a href="${router.backUrl()}">Done</a>
        </ui-button>
      </ui-onboarding-dialog>
    `,
});
