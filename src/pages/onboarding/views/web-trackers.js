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

import { html, router } from 'hybrids';

export default {
  [router.connect]: { dialog: true },
  render: () => html`
    <template layout>
      <onboarding-dialog>
        <ui-text slot="header" type="headline-m">Web Trackers</ui-text>
        <ui-text>
          To provide privacy protection features, the following information
          about web trackers is collected:
        </ui-text>
        <ui-text>
          <ul>
            <li>request metadata of potential web trackers</li>
            <li>statistical reports on navigational routes</li>
            <li>
              hashes of potentially unique identifier in requests parameters
            </li>
            <li>k-anonymity protected reports of page shows</li>
          </ul>
        </ui-text>
        <ui-text type="body-s" color="gray-600" layout="margin:top">
          Ghostery never collects nor sells any information connected to you
          like passwords, browsing history, search queries, or the contents of
          the pages you visit. Being an EU company, Ghostery strictly adheres to
          the GDPR (General Data Protection Regulation), which regulates data
          collection to ensure user's privacy.
        </ui-text>
        <ui-button slot="footer">
          <a href="${router.backUrl()}">Done</a>
        </ui-button>
      </onboarding-dialog>
    </template>
  `,
};
