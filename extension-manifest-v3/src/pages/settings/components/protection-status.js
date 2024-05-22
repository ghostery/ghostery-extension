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

import { html, msg } from 'hybrids';

export default {
  revokeAt: undefined,
  render: ({ revokeAt }) => html`
    <template layout="row items:center gap">
      ${revokeAt === undefined
        ? html`
            <gh-settings-badge type="info" uppercase>
              Active
            </gh-settings-badge>
          `
        : html`
            <gh-settings-badge type="danger" uppercase>
              Paused
            </gh-settings-badge>
            <ui-text color="gray-600" layout="grow">
              ${revokeAt
                ? html`${html`<relative-time
                    date="${new Date(revokeAt)}"
                    format="duration"
                    format-style="narrow"
                    precision="minute"
                    lang="${chrome.i18n.getUILanguage()}"
                  ></relative-time>`}
                  left`
                : msg`Always`}
            </ui-text>
          `}
    </template>
  `,
};
